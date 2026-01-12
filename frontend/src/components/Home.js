// Home.js
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";
import "./home.css";

export default function Home() {
  const [city, setCity] = useState("");
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [dailyDetail, setDailyDetail] = useState(null);
  const [chartData, setChartData] = useState(null);

  const [showProfile, setShowProfile] = useState(false);

  const [userData, setUserData] = useState({
    nama_lengkap: localStorage.getItem("nama_lengkap") || "",
    email: localStorage.getItem("email") || "",
    role: localStorage.getItem("role") || "warga",
    api_key: localStorage.getItem("apiKey") || ""
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("weather-map").setView([-2.5, 118], 5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);
    }
  }, []);

  const getWeather = async () => {
    if (!userApiKey || !city) {
      alert("API Key dan kota wajib diisi");
      return;
    }

    localStorage.setItem("apiKey", userApiKey);

    try {
      const weatherRes = await fetch(
        `http://localhost:3000/api/cuaca/current?city=${city}`,
        { headers: { "x-api-key": userApiKey } }
      );
      const weather = await weatherRes.json();
      if (!weatherRes.ok) return alert(weather.message);
      setWeatherData(weather);

      if (mapRef.current && weather.coord) {
        const { lat, lon } = weather.coord;
        mapRef.current.setView([lat, lon], 11);
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lon])
          .addTo(mapRef.current)
          .bindPopup(`Cuaca di ${weather.city}: ${weather.weather}`)
          .openPopup();
      }

      const forecastRes = await fetch(
        `http://localhost:3000/api/cuaca/forecast?city=${city}`,
        { headers: { "x-api-key": userApiKey } }
      );
      const forecast = await forecastRes.json();
      setForecastData(forecast.list);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const showDailyDetail = (dayIndex) => {
    const start = dayIndex * 8;
    const hourly = forecastData.slice(start, start + 8);
    if (!hourly.length) return;
    setDailyDetail(new Date(hourly[0].dt * 1000));
    setChartData(hourly);
  };

  useEffect(() => {
    if (!chartData || !chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: chartData.map((h) => new Date(h.dt * 1000).getHours() + ":00"),
        datasets: [
          {
            label: "Suhu (°C)",
            data: chartData.map((h) => h.main.temp),
            borderColor: "#0e4a86",
            backgroundColor: "rgba(14,74,134,0.3)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }, [chartData]);

  const getIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const formatDate = (date) => date.toLocaleDateString("id-ID", { day: "2-digit", month: "long" });

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(userData.api_key);
    alert("API Key berhasil disalin!");
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="logo"><h1>CUACAAN</h1></div>
        <nav>
          <button className={showProfile ? "" : "active"} onClick={() => setShowProfile(false)}>Beranda</button>
          <button className={showProfile ? "active" : ""} onClick={() => setShowProfile(true)}>Profile</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

{/* Profile Box */}
<div className={`profile-box ${showProfile ? "open" : ""}`}>
  <h2>Profil Pengguna</h2>
  <div className="profile-item"><strong>Nama:</strong> {userData.nama_lengkap}</div>
  <div className="profile-item"><strong>Email:</strong> {userData.email}</div>
  <div className="profile-item"><strong>Role:</strong> {userData.role}</div>
  <div className="profile-item api-key-box">
    <strong>API Key:</strong> 
    <code>{userData.api_key}</code>
    <button className="copy-btn" onClick={handleCopyApiKey}>Copy</button>
  </div>
  <button className="close-btn" onClick={() => setShowProfile(false)}>Tutup</button>
</div>


      {/* Main content */}
      <div className={`home-content ${showProfile ? "blur" : ""}`}>
        {/* Search */}
        <section className="search">
          <h2>Cek kondisi cuaca di lokasi yang Anda inginkan!</h2>
          <div className="search-form">
            <input placeholder="API Key Anda" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} />
            <input placeholder="Masukkan nama kota" value={city} onChange={(e) => setCity(e.target.value)} />
            <button onClick={getWeather}>Cari Cuaca</button>
          </div>
        </section>

        {/* Current Weather */}
        <section className="weather-map-section">
          <div className="weather-display">
            <h2>Cuaca Saat Ini</h2>
            {weatherData ? (
              <div className="current-weather">
                <div className="current-left">
                  <img src={weatherData.weather_icon ? getIcon(weatherData.weather_icon) : getIcon("01d")} alt="" />
                  <div className="temp-main">{Math.round(weatherData.temperature)}°C</div>
                  <div className="condition">{weatherData.weather}</div>
                </div>
                <div className="current-right">
                  <p><strong>Kota:</strong> {weatherData.city}</p>
                  <p><strong>Kelembapan:</strong> {weatherData.humidity}%</p>
                </div>
              </div>
            ) : <p>Ketik kota dan tekan cari untuk menampilkan cuaca.</p>}
          </div>

          {/* Map */}
          <div className="map">
            <h2>Peta Cuaca</h2>
            <div id="weather-map" style={{ height: "300px" }}></div>
          </div>
        </section>

        {/* Forecast 5 Hari */}
        <section className="forecast">
          <h2>Prakiraan Cuaca 5 Hari</h2>
          <div id="forecast-container">
            {[0,1,2,3,4].map((i) => {
              const day = forecastData[i * 8];
              if (!day) return null;
              return (
                <div key={i} className="forecast-card" onClick={() => showDailyDetail(i)}>
                  <div className="forecast-date">{formatDate(new Date(day.dt * 1000))}</div>
                  <img src={day.weather_icon ? getIcon(day.weather_icon) : getIcon("01d")} alt="" />
                  <div className="forecast-temp">{Math.round(day.main.temp)}°C</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily Chart */}
        {dailyDetail && (
          <section className="forecast">
            <h2>Detail Suhu {formatDate(dailyDetail)}</h2>
            <div style={{ height: 300 }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

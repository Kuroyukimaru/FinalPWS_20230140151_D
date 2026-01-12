const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  throw new Error("OPENWEATHER_API_KEY belum diset di file .env");
}

/**
 * ============================
 * CUACA SAAT INI (KOTA)
 * ============================
 */
exports.getCurrentWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        message: "Parameter city wajib diisi"
      });
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );

    const data = response.data;

    // Kirim juga weather_icon untuk frontend
    res.status(200).json({
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      weather: data.weather[0].description,
      weather_icon: data.weather[0].icon, // <-- Tambahkan ini
      coord: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    });

  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Gagal mengambil data cuaca",
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * ============================
 * PRAKIRAAN CUACA (5 HARI)
 * ============================
 */
exports.getWeatherForecast = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        message: "Parameter city wajib diisi"
      });
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: city,
          appid: OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );

    const data = response.data;

    // Kirim juga weather_icon untuk setiap list forecast
    const forecastList = data.list.map((item) => ({
      ...item,
      weather_icon: item.weather[0].icon
    }));

    res.status(200).json({
      city: data.city.name,
      coord: data.city.coord,
      list: forecastList
    });

  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Gagal mengambil forecast cuaca",
      error: error.response?.data?.message || error.message
    });
  }
};

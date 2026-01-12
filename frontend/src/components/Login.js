import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ nama_lengkap: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [apiKey, setApiKey] = useState(""); // state untuk API key
  const navigate = useNavigate();

  const backendUrl = "http://localhost:3000/api";

  // ===== LOGIN =====
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setMessage("Email dan password wajib diisi!");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

     if (res.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("nama_lengkap", data.user.nama_lengkap);
  localStorage.setItem("email", data.user.email);      // simpan email
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("apiKey", data.user.api_key);   // simpan apiKey
  setMessage("");
  navigate("/home"); // redirect ke Home
}
 else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
    }
  };

  // ===== REGISTER =====
  const handleRegister = async () => {
    if (!registerData.nama_lengkap || !registerData.email || !registerData.password) {
      setMessage("Semua field harus diisi!");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });

      const data = await res.json();
      console.log("Register response:", data); // debug

      if (res.ok) {
        setMessage("Registrasi berhasil!");
        setApiKey(data.user.api_key || ""); // ambil api_key dari user
        // tetap di halaman register
      } else {
        setMessage(data.message);
        setApiKey(""); // reset API key kalau gagal
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
      setApiKey(""); 
    }
  };

  // ===== COPY API KEY =====
  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      alert("API Key berhasil disalin!");
    }
  };

  return (
    <div className="wrapper">
      <div className="weather-bg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cloud cloud${i + 1}`}></div>
        ))}
      </div>

      <div className="container">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {message && <p style={{ color: "red" }}>{message}</p>}

        {isLogin ? (
          // ===== LOGIN FORM =====
          <div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <button onClick={handleLogin}>Login</button>
            <div className="switch">
              Belum punya akun? <span onClick={() => { setIsLogin(false); setMessage(""); setApiKey(""); }}>Register</span>
            </div>
          </div>
        ) : (
          // ===== REGISTER FORM =====
          <div>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={registerData.nama_lengkap}
                onChange={(e) => setRegisterData({ ...registerData, nama_lengkap: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <button onClick={handleRegister}>Register</button>
            <div className="switch">
              Sudah punya akun? <span onClick={() => { setIsLogin(true); setMessage(""); setApiKey(""); }}>Login</span>
            </div>

            {/* ===== API Key hanya di bawah register ===== */}
            {apiKey && (
              <div className="api-key" style={{ marginTop: "15px", background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
                <p><strong>API Key Anda:</strong></p>
                <code>{apiKey}</code>
                <button 
                  style={{ marginLeft: "10px" }} 
                  onClick={handleCopyApiKey}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

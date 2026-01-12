require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ===== Database =====
const sequelize = require("./config/sequelize");

// ===== Routes =====
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const adminRoutes = require("./routes/admin");
const cuacaRoutes = require("./routes/cuaca");

// ===== Express App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "ngrok-skip-browser-warning"
  ]
}));

// BODY PARSER (WAJIB)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// DISABLE CACHE (penting utk realtime frontend)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Server API aktif 🚀"
  });
});

// ===== Mount Routes =====
app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cuaca", cuacaRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
    error: err.message
  });
});

// ===== Start Server =====
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database terhubung");
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("✅ Database tersinkron");
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Database error:", err);
  });

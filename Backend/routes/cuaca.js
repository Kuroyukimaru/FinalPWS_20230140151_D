const express = require("express");
const router = express.Router();

const CuacaController = require("../controllers/cuacaController");
const apiKeyMiddleware = require("../middleware/apiKey");

// ============================
// ROUTES CUACA (OPEN API)
// ============================

// Cuaca saat ini (BERDASARKAN KOTA)
router.get("/current", apiKeyMiddleware, CuacaController.getCurrentWeather);

// Prakiraan cuaca 5 hari
router.get("/forecast", apiKeyMiddleware, CuacaController.getWeatherForecast);

module.exports = router;

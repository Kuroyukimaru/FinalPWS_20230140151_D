/**
 * Middleware API Key (x-api-key)
 * Digunakan untuk Open API (Cuaca / IoT)
 */

const User = require("../models/User"); // ⬅️ WAJIB

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    // Jika API Key tidak ada
    if (!apiKey) {
      return res.status(401).json({
        message: "API Key tidak ditemukan. Gunakan header x-api-key"
      });
    }

    // Cari user berdasarkan api_key
    const user = await User.findOne({
      where: { api_key: apiKey }
    });

    // Jika API Key tidak valid
    if (!user) {
      return res.status(403).json({
        message: "API Key tidak valid"
      });
    }

    // Simpan user dari API Key (JANGAN timpa req.user)
    req.apiUser = {
      id_user: user.id_user,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    res.status(500).json({
      message: "Kesalahan server"
    });
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ MODEL yang benar
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    // Cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: "Password salah"
      });
    }

    // Buat JWT
    const token = jwt.sign(
      {
        id_user: user.id_user,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        api_key: user.api_key // ✅ penting
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

module.exports = { login };

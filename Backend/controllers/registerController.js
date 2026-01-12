const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // 🔍 DEBUG

    const { nama_lengkap, email, password } = req.body;

    if (!nama_lengkap || !email || !password) {
      return res.status(400).json({
        message: "Data tidak lengkap"
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah terdaftar"
      });
    }

    // ROLE DARI EMAIL
    const role = email.endsWith("@admin.com") ? "admin" : "warga";

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // GENERATE API KEY
    const api_key = uuidv4();

    const user = await User.create({
      nama_lengkap,
      email,
      password: hashedPassword,
      role,
      api_key
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        api_key: user.api_key
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

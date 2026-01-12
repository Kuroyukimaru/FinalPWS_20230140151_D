const bcrypt = require("bcrypt");
const User = require("../models/User"); // model yang sama dengan register/login

// =======================
// LIHAT SEMUA USER (ADMIN)
// =======================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id_user', 'nama_lengkap', 'email', 'role', 'api_key'] // password tetap disembunyikan, tapi api_key ditampilkan
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error mengambil data", error: error.message });
    }
};

// =======================
// CREATE USER (ADMIN)
// =======================
exports.createUser = async (req, res) => {
    try {
        const { nama_lengkap, email, password, role } = req.body;

        if (!nama_lengkap || !email || !password) {
            return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
        }

        // Cek email sudah ada atau belum
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate API Key random untuk user baru
        const api_key = require("crypto").randomBytes(16).toString("hex");

        // Buat user baru
        const newUser = await User.create({
            nama_lengkap,
            email,
            password: hashedPassword,
            role: role || "warga",
            api_key
        });

        res.status(201).json({
            message: "User berhasil dibuat",
            user: {
                id_user: newUser.id_user,
                nama_lengkap: newUser.nama_lengkap,
                email: newUser.email,
                role: newUser.role,
                api_key: newUser.api_key
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal membuat user", error: error.message });
    }
};

// =======================
// UPDATE USER (nama & password)
// =======================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        if (nama_lengkap) user.nama_lengkap = nama_lengkap;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        res.status(200).json({
            message: "User berhasil diupdate",
            user: {
                id_user: user.id_user,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role,
                api_key: user.api_key
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal update user", error: error.message });
    }
};

// =======================
// DELETE USER
// =======================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await User.destroy({ where: { id_user: id } });
        if (deleted) {
            res.status(200).json({ message: "User berhasil dihapus!" });
        } else {
            res.status(404).json({ message: "User tidak ditemukan" });
        }
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus user", error: error.message });
    }
};

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// --- CRUD LENGKAP KHUSUS ADMIN ---

// 1. GET /api/admin/users -> Lihat semua user
router.get('/users', verifyToken, adminOnly, adminController.getAllUsers);

// 2. POST /api/admin/users -> Buat user baru
router.post('/users', verifyToken, adminOnly, adminController.createUser);

// 3. PUT /api/admin/users/:id -> Edit user
router.put('/users/:id', verifyToken, adminOnly, adminController.updateUser);

// 4. DELETE /api/admin/users/:id -> Hapus user
router.delete('/users/:id', verifyToken, adminOnly, adminController.deleteUser);

module.exports = router;

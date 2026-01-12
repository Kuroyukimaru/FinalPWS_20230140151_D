const adminOnly = (req, res, next) => {
  // Pastikan user sudah lolos auth (JWT)
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized. Silakan login terlebih dahulu."
    });
  }

  // Cek role admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses ditolak. Khusus admin."
    });
  }

  // Lolos sebagai admin
  next();
};

module.exports = adminOnly;

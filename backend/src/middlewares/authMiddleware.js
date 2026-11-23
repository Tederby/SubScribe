import { verifyToken } from "../controllers/authController.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Otorisasi diperlukan: silakan login terlebih dahulu untuk mengelola subscription."
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali."
    });
  }

  req.user = payload;
  next();
}

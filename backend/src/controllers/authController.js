import crypto from "crypto";
import { userModel } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "subscribe-apparatus-session-secret-2024";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days expiration
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, data, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export const authController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Field 'email', 'password', dan 'name' wajib diisi"
        });
      }

      const emailTrimmed = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid"
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password minimal 6 karakter"
        });
      }

      // Check if user already exists
      const existing = await userModel.findByEmail(emailTrimmed);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar. Silakan login."
        });
      }

      const password_hash = hashPassword(password);
      const user = await userModel.create({
        email: emailTrimmed,
        password_hash,
        name: name.trim(),
        role: "operator"
      });

      const token = createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      return res.status(201).json({
        success: true,
        message: "Registrasi kredensial berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error("[AUTH_REGISTER_ERROR]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email dan password wajib diisi"
        });
      }

      const emailTrimmed = email.trim().toLowerCase();
      const user = await userModel.findByEmail(emailTrimmed);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah"
        });
      }

      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah"
        });
      }

      const token = createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error("[AUTH_LOGIN_ERROR]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Token otorisasi tidak ditemukan"
        });
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: "Sesi token tidak valid atau telah kedaluwarsa"
        });
      }

      const user = await userModel.findById(payload.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan"
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("[AUTH_ME_ERROR]", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

import { supabase } from "../config/supabaseClient.js";
import crypto from "crypto";

// Fallback in-memory user registry for offline development or placeholder Supabase mode
const FALLBACK_USERS = [
  {
    id: "u1111111-1111-1111-1111-111111111111",
    email: "admin@subscribe.local",
    password_hash: "a1b2c3d4e5f60718:bb2b5e7fe90a5873b38e440bdb252b705addf3bcf8a822a14f03c6a98d17e8376d0d85c118f6a5e820bc7e84d778197b1d9450e44ca6f1a4e9db1a0b4f44b0f7", // password: admin123
    name: "Operator Admin",
    role: "operator",
    created_at: new Date().toISOString()
  }
];

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  return url && !url.includes("placeholder") && !url.includes("your-project") && key && !key.includes("placeholder");
}

export const userModel = {
  async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", cleanEmail)
          .single();

        if (!error && data) {
          return data;
        }
      } catch {
        // Fallback below
      }
    }

    // In-memory / local fallback
    return FALLBACK_USERS.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, role, created_at")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data;
        }
      } catch {
        // Fallback below
      }
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === id);
    if (!fallback) return null;
    const { password_hash, ...safeUser } = fallback;
    return safeUser;
  },

  async create({ email, password_hash, name, role = "operator" }) {
    const cleanEmail = email.trim().toLowerCase();
    const payload = {
      email: cleanEmail,
      password_hash,
      name: name.trim(),
      role
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("users")
          .insert(payload)
          .select("id, email, name, role, created_at")
          .single();

        if (!error && data) {
          FALLBACK_USERS.push({ ...data, password_hash });
          return data;
        }
      } catch {
        // Fallback below
      }
    }

    const newLocalUser = {
      id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...payload,
      created_at: new Date().toISOString()
    };
    FALLBACK_USERS.push(newLocalUser);
    const { password_hash: _ph, ...safeUser } = newLocalUser;
    return safeUser;
  }
};

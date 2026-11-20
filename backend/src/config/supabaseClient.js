import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from backend/.env first, with fallback to current working directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "placeholder-anon-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn("[WARN] SUPABASE_URL or SUPABASE_KEY not detected in environment. Running with placeholder client.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

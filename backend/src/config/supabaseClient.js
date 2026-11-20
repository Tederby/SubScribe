import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "placeholder-anon-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn("[WARN] SUPABASE_URL or SUPABASE_KEY not detected in environment. Running with placeholder client.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

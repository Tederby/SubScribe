import { supabase } from "../config/supabaseClient.js";

// Fallback in-memory groups for offline student lab demonstrations
let FALLBACK_GROUPS = [
  {
    id: "b1111111-1111-1111-1111-111111111111",
    user_id: "d1111111-1111-1111-1111-111111111111", // Owned by Operator Admin
    group_name: "Netflix Nonton Bareng Kos",
    service_name: "Netflix Premium",
    leader_name: "Budi Santoso",
    leader_phone: "6281234567890",
    price_per_person: 46500,
    billing_day: 15,
    member_list: "Budi Santoso, Andi Pratama, Siti Nurhaliza, Rizky Ramadhan",
    paid_members: "Budi Santoso, Andi Pratama",
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    user_id: "d1111111-1111-1111-1111-111111111111", // Owned by Operator Admin
    group_name: "Spotify Musikan Circle",
    service_name: "Spotify Family",
    leader_name: "Citra Dewi",
    leader_phone: "6289876543210",
    price_per_person: 14500,
    billing_day: 1,
    member_list: "Citra Dewi, Eko Nugroho, Fajar Setiawan, Gita Savitri, Hana Pratiwi, Ian Kasela",
    paid_members: "Citra Dewi, Eko Nugroho, Fajar Setiawan",
  },
];

const GROUP_SELECT_QUERY =
  "id, user_id, group_name, service_name, leader_name, leader_phone, price_per_person, billing_day, member_list, paid_members";

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  return url && !url.includes("placeholder") && !url.includes("your-project") && key && !key.includes("placeholder");
}

export const groupModel = {
  async getAll(userId, { limit, offset = 0 } = {}) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("split_groups")
        .select(GROUP_SELECT_QUERY)
        .order("billing_day", { ascending: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (Number.isInteger(limit) && limit > 0) {
        const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
        query = query.range(safeOffset, safeOffset + limit - 1);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[SUPABASE_GROUP_GET_ALL_ERROR]", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data || [];
    }

    // In-memory filter by user_id
    const filtered = userId ? FALLBACK_GROUPS.filter((g) => g.user_id === userId) : FALLBACK_GROUPS;
    if (Number.isInteger(limit) && limit > 0) {
      const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
      return filtered.slice(safeOffset, safeOffset + limit);
    }
    return filtered;
  },

  async getById(id, userId) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("split_groups")
        .select(GROUP_SELECT_QUERY)
        .eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.error("[SUPABASE_GROUP_GET_BY_ID_ERROR]", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    }

    return (
      FALLBACK_GROUPS.find(
        (g) => g.id === id && (!userId || g.user_id === userId)
      ) || null
    );
  },

  async create(payload) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("split_groups")
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error("[SUPABASE_GROUP_CREATE_ERROR]", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    }

    const newGroup = {
      id: `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...payload,
    };
    FALLBACK_GROUPS.push(newGroup);
    return newGroup;
  },

  async update(id, userId, payload) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("split_groups")
        .update(payload)
        .eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.select().maybeSingle();
      if (error) {
        console.error("[SUPABASE_GROUP_UPDATE_ERROR]", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    }

    const idx = FALLBACK_GROUPS.findIndex(
      (g) => g.id === id && (!userId || g.user_id === userId)
    );
    if (idx === -1) return null;
    FALLBACK_GROUPS[idx] = { ...FALLBACK_GROUPS[idx], ...payload };
    return FALLBACK_GROUPS[idx];
  },

  async remove(id, userId) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("split_groups")
        .delete()
        .eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.select().maybeSingle();
      if (error) {
        console.error("[SUPABASE_GROUP_REMOVE_ERROR]", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    }

    const target = FALLBACK_GROUPS.find(
      (g) => g.id === id && (!userId || g.user_id === userId)
    );
    if (!target) return null;
    FALLBACK_GROUPS = FALLBACK_GROUPS.filter((g) => g.id !== id);
    return target;
  },
};

import { supabase } from "../config/supabaseClient.js";

const CATEGORY_SELECT_QUERY = "id, name";

export const categoryModel = {
  async getAll({ limit, offset = 0 } = {}) {
    let query = supabase
      .from("categories")
      .select(CATEGORY_SELECT_QUERY)
      .order("name", { ascending: true });

    if (Number.isInteger(limit) && limit > 0) {
      const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
      query = query.range(safeOffset, safeOffset + limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_SELECT_QUERY)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};


import { supabase } from "../config/supabaseClient.js";

const SERVICE_SELECT_QUERY = "id, sku, name, description, monthly_price, max_slots, category_id, categories ( id, name )";

export const serviceModel = {
  async getAll({ limit, offset = 0 } = {}) {
    let query = supabase
      .from("services")
      .select(SERVICE_SELECT_QUERY)
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
      .from("services")
      .select(SERVICE_SELECT_QUERY)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select(SERVICE_SELECT_QUERY)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", id)
      .select(SERVICE_SELECT_QUERY)
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};


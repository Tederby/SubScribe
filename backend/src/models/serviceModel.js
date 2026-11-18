import { supabase } from "../config/supabaseClient.js";

const SERVICE_SELECT_QUERY = "id, sku, name, description, monthly_price, max_slots, category_id, categories ( id, name )";

export const serviceModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("services")
      .select(SERVICE_SELECT_QUERY)
      .order("name", { ascending: true });
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


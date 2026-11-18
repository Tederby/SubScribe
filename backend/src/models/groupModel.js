import { supabase } from "../config/supabaseClient.js";

export const groupModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("split_groups")
      .select("*")
      .order("billing_day", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("split_groups")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("split_groups")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from("split_groups")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase
      .from("split_groups")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};


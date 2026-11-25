import { serviceModel } from "../models/serviceModel.js";

export const serviceController = {
  async getAll(req, res) {
    try {
      const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : 0;
      const data = await serviceModel.getAll({ limit, offset });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await serviceModel.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Layanan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { sku, name, description, category_id, monthly_price, max_slots } = req.body;
      if (!sku || !name) {
        return res.status(400).json({ success: false, message: "Field 'sku' dan 'name' wajib diisi" });
      }
      const payload = {
        sku,
        name,
        description: description || null,
        category_id: category_id || null,
        monthly_price: monthly_price !== undefined ? Number(monthly_price) : 0,
        max_slots: max_slots !== undefined ? parseInt(max_slots, 10) : 1
      };
      const data = await serviceModel.create(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { sku, name, description, category_id, monthly_price, max_slots } = req.body;
      const payload = {};
      if (sku !== undefined) payload.sku = sku;
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (category_id !== undefined) payload.category_id = category_id;
      if (monthly_price !== undefined) payload.monthly_price = Number(monthly_price);
      if (max_slots !== undefined) payload.max_slots = parseInt(max_slots, 10);

      const data = await serviceModel.update(id, payload);
      if (!data) {
        return res.status(404).json({ success: false, message: "Layanan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await serviceModel.remove(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Layanan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Layanan berhasil dihapus", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


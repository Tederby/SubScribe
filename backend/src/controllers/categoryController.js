import { categoryModel } from "../models/categoryModel.js";

export const categoryController = {
  async getAll(req, res) {
    try {
      const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : 0;
      const data = await categoryModel.getAll({ limit, offset });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await categoryModel.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Field 'name' wajib diisi" });
      }
      const data = await categoryModel.create({ name });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Field 'name' wajib diisi" });
      }
      const data = await categoryModel.update(id, { name });
      if (!data) {
        return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await categoryModel.remove(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Kategori berhasil dihapus", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


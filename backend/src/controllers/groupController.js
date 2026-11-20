import { groupModel } from "../models/groupModel.js";

export const groupController = {
  async getAll(req, res) {
    try {
      const data = await groupModel.getAll();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await groupModel.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Grup patungan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { group_name, service_name, leader_name, leader_phone, price_per_person, billing_day, member_list, paid_members } = req.body;
      if (!group_name || !service_name || !leader_name) {
        return res.status(400).json({
          success: false,
          message: "Field 'group_name', 'service_name', dan 'leader_name' wajib diisi"
        });
      }
      const payload = {
        group_name,
        service_name,
        leader_name,
        leader_phone: leader_phone || "",
        price_per_person: price_per_person !== undefined ? Number(price_per_person) : 0,
        billing_day: billing_day !== undefined ? parseInt(billing_day, 10) : 1,
        member_list: member_list || "",
        paid_members: paid_members || leader_name
      };
      const data = await groupModel.create(payload);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { group_name, service_name, leader_name, leader_phone, price_per_person, billing_day, member_list, paid_members } = req.body;
      const payload = {};
      if (group_name !== undefined) payload.group_name = group_name;
      if (service_name !== undefined) payload.service_name = service_name;
      if (leader_name !== undefined) payload.leader_name = leader_name;
      if (leader_phone !== undefined) payload.leader_phone = leader_phone;
      if (price_per_person !== undefined) payload.price_per_person = Number(price_per_person);
      if (billing_day !== undefined) payload.billing_day = parseInt(billing_day, 10);
      if (member_list !== undefined) payload.member_list = member_list;
      if (paid_members !== undefined) payload.paid_members = paid_members;

      const data = await groupModel.update(id, payload);
      if (!data) {
        return res.status(404).json({ success: false, message: "Grup patungan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await groupModel.remove(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Grup patungan tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Grup berhasil dihapus", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const STORAGE_KEYS = {
  CATEGORIES: "subscribe_apparatus_categories",
  SERVICES: "subscribe_apparatus_services",
  GROUPS: "subscribe_apparatus_groups",
  SYS_STATE: "subscribe_apparatus_system",
};

export const INITIAL_CATEGORIES = [
  { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  { id: "c2222222-2222-2222-2222-222222222222", name: "Musik" },
  { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  { id: "c4444444-4444-4444-4444-444444444444", name: "Cloud & Storage" },
];

export const INITIAL_SERVICES = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    sku: "NETFLIX-PREM",
    name: "Netflix Premium",
    description: "Paket langganan 4K Ultra HD dengan akses simultan 4 layar profil mandiri.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 186000,
    max_slots: 4,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    sku: "SPOTIFY-FAM",
    name: "Spotify Family",
    description: "Paket musik tanpa iklan untuk hingga 6 akun keluarga terpisah.",
    category_id: "c2222222-2222-2222-2222-222222222222",
    monthly_price: 86900,
    max_slots: 6,
    categories: { id: "c2222222-2222-2222-2222-222222222222", name: "Musik" },
  },
  {
    id: "s3333333-3333-3333-3333-333333333333",
    sku: "YOUTUBE-FAM",
    name: "YouTube Premium Family",
    description: "Bebas iklan, putar latar belakang, dan YouTube Music untuk 5 anggota keluarga.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 139000,
    max_slots: 5,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "s4444444-4444-4444-4444-444444444444",
    sku: "CHATGPT-PLUS",
    name: "ChatGPT Plus Team",
    description: "Akses GPT-4o, pembuatan gambar DALL-E, dan canvas kolaboratif 3 seat.",
    category_id: "c3333333-3333-3333-3333-333333333333",
    monthly_price: 300000,
    max_slots: 3,
    categories: { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  },
  {
    id: "s5555555-5555-5555-5555-555555555555",
    sku: "GOOGLE-ONE-2TB",
    name: "Google One 2TB",
    description: "Penyimpanan cloud Google Photos dan Drive bersama 5 anggota keluarga.",
    category_id: "c4444444-4444-4444-4444-444444444444",
    monthly_price: 135000,
    max_slots: 5,
    categories: { id: "c4444444-4444-4444-4444-444444444444", name: "Cloud & Storage" },
  },
];

export const INITIAL_GROUPS = [
  {
    id: "g1111111-1111-1111-1111-111111111111",
    group_name: "Netflix Nonton Bareng",
    service_name: "Netflix Premium",
    leader_name: "Budi Santoso",
    leader_phone: "6281234567890",
    price_per_person: 46500,
    billing_day: 15,
    member_list: "Budi, Andi, Siti, Rizky",
    paid_members: ["Budi", "Andi"],
  },
  {
    id: "g2222222-2222-2222-2222-222222222222",
    group_name: "Spotify Musikan",
    service_name: "Spotify Family",
    leader_name: "Citra Dewi",
    leader_phone: "6289876543210",
    price_per_person: 14500,
    billing_day: 1,
    member_list: "Citra, Eko, Fajar, Gita, Hana, Ian",
    paid_members: ["Citra", "Eko", "Fajar"],
  },
];

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write error", e);
  }
}

export const dataService = {
  // 1. Categories
  async getCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        saveLocal(STORAGE_KEYS.CATEGORIES, json.data);
        return { data: json.data, source: "live" };
      }
    } catch {
      // fallback to local cache
    }
    const cached = loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return { data: cached, source: "cache" };
  },

  async createCategory(name) {
    const newCat = {
      id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
    };

    // try backend
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        signal: AbortSignal.timeout(3000),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const list = loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
        list.push(json.data);
        saveLocal(STORAGE_KEYS.CATEGORIES, list);
        return json.data;
      }
    } catch {
      // offline fallback
    }

    const list = loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    list.push(newCat);
    saveLocal(STORAGE_KEYS.CATEGORIES, list);
    return newCat;
  },

  // 2. Services
  async getServices() {
    try {
      const res = await fetch(`${API_URL}/api/services`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        saveLocal(STORAGE_KEYS.SERVICES, json.data);
        return { data: json.data, source: "live" };
      }
    } catch {
      // fallback
    }
    const cached = loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return { data: cached, source: "cache" };
  },

  async getServiceById(id) {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch {
      // fallback
    }
    const list = loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return list.find((s) => s.id === id) || null;
  },

  async createService(payload) {
    const categories = loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const cat = categories.find((c) => c.id === payload.category_id);
    const newService = {
      id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      sku: payload.sku.toUpperCase(),
      name: payload.name,
      description: payload.description || "",
      category_id: payload.category_id,
      monthly_price: Number(payload.monthly_price) || 0,
      max_slots: Number(payload.max_slots) || 1,
      categories: cat ? { id: cat.id, name: cat.name } : null,
    };

    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const list = loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
        list.push(json.data);
        saveLocal(STORAGE_KEYS.SERVICES, list);
        return json.data;
      }
    } catch {
      // offline fallback
    }

    const list = loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    list.push(newService);
    saveLocal(STORAGE_KEYS.SERVICES, list);
    return newService;
  },

  // 3. Groups
  async getGroups() {
    try {
      const res = await fetch(`${API_URL}/api/groups`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // preserve paid_members from local cache if backend doesn't have it
        const cached = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
        const merged = json.data.map((g) => {
          const c = cached.find((x) => x.id === g.id);
          return {
            ...g,
            paid_members: c?.paid_members || [],
          };
        });
        saveLocal(STORAGE_KEYS.GROUPS, merged);
        return { data: merged, source: "live" };
      }
    } catch {
      // fallback
    }
    const cached = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    return { data: cached, source: "cache" };
  },

  async getGroupById(id) {
    try {
      const res = await fetch(`${API_URL}/api/groups/${id}`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && json.data) {
        const cached = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
        const c = cached.find((x) => x.id === id);
        return {
          ...json.data,
          paid_members: c?.paid_members || [],
        };
      }
    } catch {
      // fallback
    }
    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    return list.find((g) => g.id === id) || null;
  },

  async createGroup(payload) {
    const newGroup = {
      id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      group_name: payload.group_name,
      service_name: payload.service_name,
      leader_name: payload.leader_name,
      leader_phone: payload.leader_phone,
      price_per_person: Number(payload.price_per_person) || 0,
      billing_day: Number(payload.billing_day) || 1,
      member_list: payload.member_list || "",
      paid_members: [payload.leader_name], // Leader is assumed paid by default
    };

    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
        const saved = { ...json.data, paid_members: [payload.leader_name] };
        list.push(saved);
        saveLocal(STORAGE_KEYS.GROUPS, list);
        return saved;
      }
    } catch {
      // offline fallback
    }

    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    list.push(newGroup);
    saveLocal(STORAGE_KEYS.GROUPS, list);
    return newGroup;
  },

  async updateGroup(id, payload) {
    try {
      await fetch(`${API_URL}/api/groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // offline
    }

    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const idx = list.findIndex((g) => g.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payload };
      saveLocal(STORAGE_KEYS.GROUPS, list);
      return list[idx];
    }
    return null;
  },

  async deleteGroup(id) {
    try {
      await fetch(`${API_URL}/api/groups/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // offline
    }

    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const filtered = list.filter((g) => g.id !== id);
    saveLocal(STORAGE_KEYS.GROUPS, filtered);
    return true;
  },

  // Toggle member payment status for a specific group
  toggleMemberPayment(groupId, memberName) {
    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const grp = list.find((g) => g.id === groupId);
    if (!grp) return null;

    const paidList = grp.paid_members || [];
    let updated;
    if (paidList.includes(memberName)) {
      updated = paidList.filter((m) => m !== memberName);
    } else {
      updated = [...paidList, memberName];
    }
    grp.paid_members = updated;
    saveLocal(STORAGE_KEYS.GROUPS, list);
    return updated;
  },

  // Add member to group roster
  addMemberToGroup(groupId, newMemberName) {
    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const grp = list.find((g) => g.id === groupId);
    if (!grp) return null;

    const existing = grp.member_list
      ? grp.member_list.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (!existing.includes(newMemberName.trim())) {
      existing.push(newMemberName.trim());
      grp.member_list = existing.join(", ");
      saveLocal(STORAGE_KEYS.GROUPS, list);

      // Async backend update
      this.updateGroup(groupId, { member_list: grp.member_list });
    }
    return grp;
  },

  // Reset to initial factory presets
  resetToFactory() {
    saveLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    saveLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    saveLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    return true;
  },

  // Export full snapshot as JSON
  exportSnapshot() {
    return {
      version: "1.2.0-utilitarian",
      exported_at: new Date().toISOString(),
      categories: loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
      services: loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
      groups: loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS),
    };
  },

  // Import snapshot from JSON string
  importSnapshot(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.categories) saveLocal(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.services) saveLocal(STORAGE_KEYS.SERVICES, data.services);
      if (data.groups) saveLocal(STORAGE_KEYS.GROUPS, data.groups);
      return true;
    } catch {
      return false;
    }
  },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const STORAGE_KEYS = {
  CATEGORIES: "subscribe_apparatus_categories",
  SERVICES: "subscribe_apparatus_services",
  GROUPS: "subscribe_apparatus_groups",
  SYS_STATE: "subscribe_apparatus_system",
  AUTH_TOKEN: "subscribe_auth_token",
  AUTH_USER: "subscribe_auth_user",
};

/**
 * Sanitizes Indonesian phone numbers into the standard 628xxx format.
 * Strips whitespace, dashes, parentheticals, and maps 08 / +628 / 8 to 628.
 */
export function sanitizeIndonesianPhone(input) {
  if (!input) return "";
  let digits = input.toString().replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) {
    digits = "62" + digits.slice(3);
  } else if (digits.startsWith("08")) {
    digits = "628" + digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "628" + digits.slice(1);
  }
  return digits.replace(/[^\d]/g, "");
}

/**
 * Validates whether the phone number complies with standard Indonesian mobile format 628xxx (10 to 15 digits total).
 * Returns true if empty (as phone is optional).
 */
export function validateIndonesianPhone(phone) {
  if (!phone || !phone.toString().trim()) return true;
  const cleaned = sanitizeIndonesianPhone(phone);
  return /^628[0-9]{8,12}$/.test(cleaned);
}

export const INITIAL_CATEGORIES = [
  { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  { id: "c2222222-2222-2222-2222-222222222222", name: "Musik" },
  { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  { id: "c4444444-4444-4444-4444-444444444444", name: "Cloud & Storage" },
  { id: "c5555555-5555-5555-5555-555555555555", name: "Gaming & Edukasi" },
];

export const INITIAL_SERVICES = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    sku: "NETFLIX-PREM",
    name: "Netflix Premium",
    description: "Paket langganan 4K Ultra HD + HDR dengan akses simultan 4 layar dan profil mandiri.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 186000,
    max_slots: 4,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    sku: "SPOTIFY-FAM",
    name: "Spotify Family",
    description: "Paket musik lossless bebas iklan untuk hingga 6 akun keluarga terpisah.",
    category_id: "c2222222-2222-2222-2222-222222222222",
    monthly_price: 86900,
    max_slots: 6,
    categories: { id: "c2222222-2222-2222-2222-222222222222", name: "Musik" },
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    sku: "YOUTUBE-FAM",
    name: "YouTube Premium Family",
    description: "Bebas iklan, putar di latar belakang, dan YouTube Music Premium untuk 5 anggota.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 139000,
    max_slots: 5,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "a4444444-4444-4444-4444-444444444444",
    sku: "CHATGPT-PLUS",
    name: "ChatGPT Plus Team",
    description: "Akses GPT-4o tanpa batas, DALL-E 3, pembuatan custom GPTs, dan workspace kolaboratif.",
    category_id: "c3333333-3333-3333-3333-333333333333",
    monthly_price: 300000,
    max_slots: 3,
    categories: { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  },
  {
    id: "a5555555-5555-5555-5555-555555555555",
    sku: "DISNEY-PREM",
    name: "Disney+ Hotstar Premium",
    description: "Streaming 4K Ultra HD film Marvel, Disney, Pixar, dan serial lokal hingga 3 layar aktif.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 119000,
    max_slots: 3,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "a6666666-6666-6666-6666-666666666666",
    sku: "CANVA-TEAM",
    name: "Canva Pro Team",
    description: "Desain profesional kolaboratif, Brand Kit premium, Magic Switch AI untuk 5 seat.",
    category_id: "c3333333-3333-3333-3333-333333333333",
    monthly_price: 124000,
    max_slots: 5,
    categories: { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  },
  {
    id: "a7777777-7777-7777-7777-777777777777",
    sku: "APPLE-ONE-PREM",
    name: "Apple One Premier",
    description: "Apple Music, Apple TV+, Apple Arcade, dan iCloud+ 2TB berbagi hingga 6 anggota.",
    category_id: "c4444444-4444-4444-4444-444444444444",
    monthly_price: 159000,
    max_slots: 6,
    categories: { id: "c4444444-4444-4444-4444-444444444444", name: "Cloud & Storage" },
  },
  {
    id: "a8888888-8888-8888-8888-888888888888",
    sku: "GOOGLE-ONE-2TB",
    name: "Google One 2TB Family",
    description: "Penyimpanan cloud Google Photos dan Drive bersama 5 anggota keluarga + Gemini Advanced.",
    category_id: "c4444444-4444-4444-4444-444444444444",
    monthly_price: 135000,
    max_slots: 5,
    categories: { id: "c4444444-4444-4444-4444-444444444444", name: "Cloud & Storage" },
  },
  {
    id: "a9999999-9999-9999-9999-999999999999",
    sku: "PRIME-VIDEO",
    name: "Amazon Prime Video",
    description: "Serial original The Boys, Rings of Power, resolusi 4K HDR dengan 3 layar simultan.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    monthly_price: 59000,
    max_slots: 3,
    categories: { id: "c1111111-1111-1111-1111-111111111111", name: "Video Streaming" },
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    sku: "NINTENDO-FAM",
    name: "Nintendo Switch Online Family",
    description: "Akses multiplayer online Nintendo Switch, cloud save, dan katalog retro game 8 akun.",
    category_id: "c5555555-5555-5555-5555-555555555555",
    monthly_price: 65000,
    max_slots: 8,
    categories: { id: "c5555555-5555-5555-5555-555555555555", name: "Gaming & Edukasi" },
  },
  {
    id: "abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    sku: "DUOLINGO-FAM",
    name: "Duolingo Super Family",
    description: "Belajar bahasa bebas iklan, nyawa tanpa batas, dan Family Quest untuk 6 anggota.",
    category_id: "c5555555-5555-5555-5555-555555555555",
    monthly_price: 149000,
    max_slots: 6,
    categories: { id: "c5555555-5555-5555-5555-555555555555", name: "Gaming & Edukasi" },
  },
  {
    id: "accccccc-cccc-cccc-cccc-cccccccccccc",
    sku: "MIDJOURNEY-STD",
    name: "Midjourney Standard",
    description: "Akses fast GPU generation 15 jam/bulan, relax GPU unlimited, dan shared gallery 3 seat.",
    category_id: "c3333333-3333-3333-3333-333333333333",
    monthly_price: 450000,
    max_slots: 3,
    categories: { id: "c3333333-3333-3333-3333-333333333333", name: "Produktivitas AI" },
  },
];

export const INITIAL_GROUPS = [
  {
    id: "b1111111-1111-1111-1111-111111111111",
    group_name: "Netflix Nonton Bareng Kos",
    service_name: "Netflix Premium",
    leader_name: "Budi Santoso",
    leader_phone: "6281234567890",
    price_per_person: 46500,
    billing_day: 15,
    member_list: "Budi Santoso, Andi Pratama, Siti Nurhaliza, Rizky Ramadhan",
    paid_members: ["Budi Santoso", "Andi Pratama"],
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    group_name: "Spotify Musikan Circle",
    service_name: "Spotify Family",
    leader_name: "Citra Dewi",
    leader_phone: "6289876543210",
    price_per_person: 14500,
    billing_day: 1,
    member_list: "Citra Dewi, Eko Nugroho, Fajar Setiawan, Gita Savitri, Hana Pratiwi, Ian Kasela",
    paid_members: ["Citra Dewi", "Eko Nugroho", "Fajar Setiawan"],
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
  getAuthHeaders() {
    const token = this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  getUserGroupKey() {
    const user = this.getStoredUser();
    return user ? `${STORAGE_KEYS.GROUPS}_${user.id}` : STORAGE_KEYS.GROUPS;
  },

  getUserInitialGroups() {
    const user = this.getStoredUser();
    return user && user.email === "admin@subscribe.local" ? INITIAL_GROUPS : [];
  },

  // 1. Categories
  async getCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`, { signal: AbortSignal.timeout(2500) });
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        // Safe offline merge: preserve locally created categories (id starting with c-)
        const cached = loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
        const localOnly = cached.filter((c) => c.id.startsWith("c-") && !json.data.some((b) => b.id === c.id));
        const merged = [...json.data, ...localOnly];
        saveLocal(STORAGE_KEYS.CATEGORIES, merged);
        return { data: merged, source: "live" };
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
        // Safe merge: keep local services created offline
        const cached = loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
        const localOnly = cached.filter((c) => c.id.startsWith("s-") && !json.data.some((b) => b.id === c.id));
        const merged = [...json.data, ...localOnly];
        saveLocal(STORAGE_KEYS.SERVICES, merged);
        return { data: merged, source: "live" };
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
      name: payload.name.trim(),
      description: payload.description ? payload.description.trim() : "",
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

  // 3. Groups (Scoped per authenticated User)
  async getGroups() {
    const user = this.getStoredUser();
    if (!user) {
      return { data: [], source: "auth_required" };
    }

    const storageKey = this.getUserGroupKey();
    const fallbackGroups = this.getUserInitialGroups();

    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        headers: { ...this.getAuthHeaders() },
        signal: AbortSignal.timeout(2500),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const cached = loadLocal(storageKey, fallbackGroups);
        const localOnlyGroups = cached.filter(
          (c) => c.id.startsWith("g-") && !json.data.some((b) => b.id === c.id)
        );

        const merged = [
          ...json.data.map((g) => {
            const c = cached.find((x) => x.id === g.id);
            let paidList = [];
            if (c && Array.isArray(c.paid_members)) {
              paidList = c.paid_members;
            } else if (g.paid_members) {
              paidList = g.paid_members.split(",").map((s) => s.trim()).filter(Boolean);
            } else {
              paidList = [g.leader_name];
            }
            return {
              ...g,
              paid_members: paidList,
            };
          }),
          ...localOnlyGroups,
        ];

        saveLocal(storageKey, merged);
        return { data: merged, source: "live" };
      }
    } catch {
      // fallback
    }
    const cached = loadLocal(storageKey, fallbackGroups);
    return { data: cached, source: "cache" };
  },

  async getGroupById(id) {
    const storageKey = this.getUserGroupKey();
    const fallbackGroups = this.getUserInitialGroups();

    try {
      const res = await fetch(`${API_URL}/api/groups/${id}`, {
        headers: { ...this.getAuthHeaders() },
        signal: AbortSignal.timeout(2500),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const cached = loadLocal(storageKey, fallbackGroups);
        const c = cached.find((x) => x.id === id);
        return {
          ...json.data,
          paid_members: c?.paid_members || (json.data.paid_members ? json.data.paid_members.split(",").map((s) => s.trim()) : [json.data.leader_name]),
        };
      }
    } catch {
      // fallback
    }
    const list = loadLocal(storageKey, fallbackGroups);
    return list.find((g) => g.id === id) || null;
  },

  async createGroup(payload) {
    const user = this.getStoredUser();
    const storageKey = this.getUserGroupKey();
    const fallbackGroups = this.getUserInitialGroups();

    const sanitizedPhone = sanitizeIndonesianPhone(payload.leader_phone);
    const paidList = Array.isArray(payload.paid_members)
      ? payload.paid_members
      : [payload.leader_name];

    const newGroup = {
      id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: user?.id,
      group_name: payload.group_name.trim(),
      service_name: payload.service_name.trim(),
      leader_name: payload.leader_name.trim(),
      leader_phone: sanitizedPhone,
      price_per_person: Number(payload.price_per_person) || 0,
      billing_day: Number(payload.billing_day) || 1,
      member_list: payload.member_list ? payload.member_list.trim() : "",
      paid_members: paidList,
    };

    const backendPayload = {
      ...payload,
      leader_phone: sanitizedPhone,
      paid_members: paidList.join(", "),
    };

    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(backendPayload),
        signal: AbortSignal.timeout(3000),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const list = loadLocal(storageKey, fallbackGroups);
        const saved = { ...json.data, paid_members: paidList };
        list.push(saved);
        saveLocal(storageKey, list);
        return saved;
      }
    } catch {
      // offline fallback
    }

    const list = loadLocal(storageKey, fallbackGroups);
    list.push(newGroup);
    saveLocal(storageKey, list);
    return newGroup;
  },

  async updateGroup(id, payload) {
    const storageKey = this.getUserGroupKey();
    const fallbackGroups = this.getUserInitialGroups();

    const list = loadLocal(storageKey, fallbackGroups);
    const idx = list.findIndex((g) => g.id === id);
    if (idx === -1) return null;

    if (payload.leader_phone) {
      payload.leader_phone = sanitizeIndonesianPhone(payload.leader_phone);
    }

    const backendPayload = { ...payload };
    if (Array.isArray(payload.paid_members)) {
      backendPayload.paid_members = payload.paid_members.join(", ");
    }

    try {
      await fetch(`${API_URL}/api/groups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(backendPayload),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // offline
    }

    list[idx] = { ...list[idx], ...payload };
    saveLocal(storageKey, list);
    return list[idx];
  },

  async deleteGroup(id) {
    const storageKey = this.getUserGroupKey();
    const fallbackGroups = this.getUserInitialGroups();

    try {
      await fetch(`${API_URL}/api/groups/${id}`, {
        method: "DELETE",
        headers: { ...this.getAuthHeaders() },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // offline
    }

    const list = loadLocal(storageKey, fallbackGroups);
    const filtered = list.filter((g) => g.id !== id);
    saveLocal(storageKey, filtered);
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

    // Asynchronously update backend if possible
    this.updateGroup(groupId, { paid_members: updated });
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
    const trimmed = newMemberName.trim();
    if (!existing.includes(trimmed)) {
      existing.push(trimmed);
      grp.member_list = existing.join(", ");
      saveLocal(STORAGE_KEYS.GROUPS, list);

      // Async backend update
      this.updateGroup(groupId, { member_list: grp.member_list });
    }
    return grp;
  },

  // Remove member from group roster and payment list
  removeMemberFromGroup(groupId, memberName) {
    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const grp = list.find((g) => g.id === groupId);
    if (!grp) return null;

    const existing = grp.member_list
      ? grp.member_list.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const filteredMembers = existing.filter((m) => m !== memberName);
    const filteredPaid = (grp.paid_members || []).filter((m) => m !== memberName);

    grp.member_list = filteredMembers.join(", ");
    grp.paid_members = filteredPaid;
    saveLocal(STORAGE_KEYS.GROUPS, list);

    // Async backend update
    this.updateGroup(groupId, {
      member_list: grp.member_list,
      paid_members: filteredPaid,
    });
    return grp;
  },

  // Reset billing cycle for a new month (marks all unpaid except optionally the leader)
  resetBillingCycle(groupId) {
    const list = loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    const grp = list.find((g) => g.id === groupId);
    if (!grp) return null;

    // Reset paid members: keep leader if desired or start fresh
    grp.paid_members = [grp.leader_name];
    saveLocal(STORAGE_KEYS.GROUPS, list);

    this.updateGroup(groupId, { paid_members: grp.paid_members });
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
      version: "1.3.0-utilitarian",
      exported_at: new Date().toISOString(),
      categories: loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
      services: loadLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
      groups: loadLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS),
    };
  },

  // Import snapshot from JSON string with schema validation
  importSnapshot(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && typeof data === "object") {
        if (Array.isArray(data.categories)) saveLocal(STORAGE_KEYS.CATEGORIES, data.categories);
        if (Array.isArray(data.services)) saveLocal(STORAGE_KEYS.SERVICES, data.services);
        if (Array.isArray(data.groups)) saveLocal(STORAGE_KEYS.GROUPS, data.groups);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  notifyAuthChanged(user = null) {
    if (typeof window !== "undefined") {
      const activeUser = user !== undefined ? user : this.getStoredUser();
      window.dispatchEvent(
        new CustomEvent("subscribe:auth-changed", { detail: { user: activeUser } })
      );
    }
  },

  // 4. Lightweight Credential Authentication (Zero-Quota Burden on Supabase)
  async login(email, password) {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3500),
      });
      const json = await res.json();
      if (json.success && json.data) {
        saveLocal(STORAGE_KEYS.AUTH_TOKEN, json.data.token);
        saveLocal(STORAGE_KEYS.AUTH_USER, json.data.user);
        this.notifyAuthChanged(json.data.user);
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message || "Email atau password tidak sesuai" };
    } catch {
      // Local fallback auth for offline student lab demonstrations
      if (email.toLowerCase() === "admin@subscribe.local" && password === "admin123") {
        const mockData = {
          user: {
            id: "u1111111-1111-1111-1111-111111111111",
            email: "admin@subscribe.local",
            name: "Operator Admin (Local)",
            role: "operator",
          },
          token: "local-session-token",
        };
        saveLocal(STORAGE_KEYS.AUTH_TOKEN, mockData.token);
        saveLocal(STORAGE_KEYS.AUTH_USER, mockData.user);
        this.notifyAuthChanged(mockData.user);
        return { success: true, data: mockData };
      }
      return { success: false, message: "Koneksi ke server backend gagal" };
    }
  },

  async register(email, password, name) {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        signal: AbortSignal.timeout(3500),
      });
      const json = await res.json();
      if (json.success && json.data) {
        saveLocal(STORAGE_KEYS.AUTH_TOKEN, json.data.token);
        saveLocal(STORAGE_KEYS.AUTH_USER, json.data.user);
        this.notifyAuthChanged(json.data.user);
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message || "Gagal melakukan registrasi" };
    } catch {
      return { success: false, message: "Koneksi ke server backend gagal" };
    }
  },

  getStoredUser() {
    return loadLocal(STORAGE_KEYS.AUTH_USER, null);
  },

  getCurrentUser() {
    return this.getStoredUser();
  },

  getStoredToken() {
    return loadLocal(STORAGE_KEYS.AUTH_TOKEN, null);
  },

  getCurrentToken() {
    return this.getStoredToken();
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.notifyAuthChanged(null);
  },
};

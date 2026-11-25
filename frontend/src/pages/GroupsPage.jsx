import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Cpu,
  Plus,
  Calendar,
  ShieldCheck,
  X,
  Users,
  Wallet,
  ArrowUpRight,
  User,
  Phone,
  AlertCircle,
  Tag,
  Check,
  Lock,
  LogIn,
  Key,
  CheckCircle2,
} from "lucide-react";
import {
  dataService,
  sanitizeIndonesianPhone,
  validateIndonesianPhone,
} from "../services/dataService";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * Accurately computes remaining days until next billing day,
 * handling varying month lengths (28, 29, 30, 31).
 */
function calculateDueDays(billingDay) {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const effectiveBillingDay = Math.min(billingDay, daysInCurrentMonth);

  if (effectiveBillingDay === currentDay) {
    return { days: 0, label: "DUE TODAY!", isUrgent: true };
  }

  if (effectiveBillingDay > currentDay) {
    const diff = effectiveBillingDay - currentDay;
    return {
      days: diff,
      label: `${diff} HARI LAGI`,
      isUrgent: diff <= 3,
    };
  }

  // Next month rollover
  const daysInNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 2,
    0
  ).getDate();
  const effectiveNextBillingDay = Math.min(billingDay, daysInNextMonth);
  const diff = daysInCurrentMonth - currentDay + effectiveNextBillingDay;
  return {
    days: diff,
    label: `${diff} HARI LAGI`,
    isUrgent: false,
  };
}

export default function GroupsPage() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => dataService.getStoredUser());
  const [groups, setGroups] = useState(() => dataService.getCachedGroups());
  const [services, setServices] = useState(() => dataService.getCachedServices());
  const [loading, setLoading] = useState(() => {
    const user = dataService.getStoredUser();
    return user ? dataService.getCachedGroups().length === 0 : false;
  });
  const [showModal, setShowModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Auth gate form state
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authFeedback, setAuthFeedback] = useState(null);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [billingDay, setBillingDay] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Enhanced Member roster state in init modal
  const [leaderIncluded, setLeaderIncluded] = useState(true);
  const [memberChips, setMemberChips] = useState([]);
  const [newMemberInput, setNewMemberInput] = useState("");

  const formatRupiah = useCallback((val) => currencyFormatter.format(val), []);

  const loadGroups = useCallback(async () => {
    try {
      const [groupsRes, servicesRes] = await Promise.all([
        dataService.getGroups(),
        dataService.getServices(),
      ]);
      setGroups(groupsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error("Gagal membaca grup:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();

    const handleAuthChange = () => {
      const u = dataService.getStoredUser();
      setCurrentUser(u);
      loadGroups();
    };

    window.addEventListener("subscribe:auth-changed", handleAuthChange);
    return () => window.removeEventListener("subscribe:auth-changed", handleAuthChange);
  }, [loadGroups]);

  const handleInlineAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthFeedback(null);
    try {
      if (authMode === "login") {
        const res = await dataService.login(authEmail, authPassword);
        if (res.success && res.data) {
          setCurrentUser(res.data.user);
          setAuthEmail("");
          setAuthPassword("");
          await loadGroups();
        } else {
          setAuthFeedback({ type: "error", text: res.message || "Email atau password salah" });
        }
      } else {
        if (!authName.trim()) {
          setAuthFeedback({ type: "error", text: "Nama operator wajib diisi" });
          setAuthLoading(false);
          return;
        }
        const res = await dataService.register(authEmail, authPassword, authName);
        if (res.success && res.data) {
          setCurrentUser(res.data.user);
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
          await loadGroups();
        } else {
          setAuthFeedback({ type: "error", text: res.message || "Gagal registrasi" });
        }
      }
    } catch {
      setAuthFeedback({ type: "error", text: "Terjadi kesalahan autentikasi" });
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle prefill from ServiceDetailPage
  useEffect(() => {
    if (location.state?.prefillServiceName) {
      setServiceName(location.state.prefillServiceName);
      if (location.state.prefillTotalMonthlyPrice) {
        setTotalPrice(location.state.prefillTotalMonthlyPrice.toString());
      } else if (location.state.prefillPrice) {
        setTotalPrice(
          (
            Number(location.state.prefillPrice) *
            (location.state.prefillSlots || 4)
          ).toString()
        );
      }
      setShowModal(true);
    }
  }, [location.state]);

  // Synchronize leader phone input with 628xxx format
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const sanitized = sanitizeIndonesianPhone(raw);
    setLeaderPhone(sanitized);

    if (sanitized && !validateIndonesianPhone(sanitized)) {
      setPhoneError("Nomor wajib format 628xxx (Contoh: 6281234567890)");
    } else {
      setPhoneError("");
    }
  };

  // Service selection dropdown handler
  const handleServiceSelectChange = (e) => {
    const val = e.target.value;
    if (!val || val === "custom") {
      return;
    }
    const found = services.find((s) => s.id === val);
    if (found) {
      setServiceName(found.name);
      setTotalPrice(found.monthly_price.toString());
    }
  };

  // Add member chip
  const handleAddMemberChip = () => {
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;

    const currentPj = leaderName.trim().toLowerCase();

    const isDuplicate = (name, currentList) => {
      const lower = name.toLowerCase();
      if (
        leaderIncluded &&
        (lower === "pj" ||
          lower === "pj (penanggung jawab)" ||
          (currentPj && lower === currentPj))
      ) {
        return true;
      }
      return currentList.some((x) => x.toLowerCase() === lower);
    };

    // Check if comma separated input
    if (trimmed.includes(",")) {
      const parts = trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setMemberChips((prev) => {
        const next = [...prev];
        parts.forEach((p) => {
          if (!isDuplicate(p, next)) {
            next.push(p);
          }
        });
        return next;
      });
    } else {
      if (!isDuplicate(trimmed, memberChips)) {
        setMemberChips((prev) => [...prev, trimmed]);
      }
    }
    setNewMemberInput("");
  };

  const handleRemoveMemberChip = (nameToRemove) => {
    setMemberChips((prev) => prev.filter((m) => m !== nameToRemove));
  };

  // Effective full roster list: PJ is guaranteed counted when leaderIncluded is true
  const activeRoster = useMemo(() => {
    const pjDisplayName = leaderName.trim() || "PJ (Penanggung Jawab)";
    const filteredChips = memberChips.filter(
      (m) =>
        m.toLowerCase() !== pjDisplayName.toLowerCase() &&
        (!leaderName.trim() || m.toLowerCase() !== leaderName.trim().toLowerCase())
    );
    if (leaderIncluded) {
      return [pjDisplayName, ...filteredChips];
    }
    return filteredChips;
  }, [memberChips, leaderIncluded, leaderName]);

  // Real-time calculation of price per person
  const calculatedPricePerPerson = useMemo(() => {
    const total = Number(totalPrice) || 0;
    const count = activeRoster.length;
    if (count === 0) return total;
    return Math.round(total / count);
  }, [totalPrice, activeRoster]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pjName = leaderName.trim();
    if (!groupName.trim() || !serviceName.trim() || !pjName) {
      alert("Field nama grup, layanan, dan nama PJ wajib diisi.");
      return;
    }

    if (leaderPhone.trim() && !validateIndonesianPhone(leaderPhone)) {
      alert("Nomor WhatsApp PJ tidak valid. Gunakan format 628xxx (10-15 digit) atau kosongkan.");
      return;
    }

    const otherMembers = memberChips.filter(
      (m) => m.toLowerCase() !== pjName.toLowerCase()
    );
    const finalMemberList = leaderIncluded ? [pjName, ...otherMembers] : otherMembers;

    if (finalMemberList.length === 0) {
      alert("Minimal harus ada 1 anggota dalam grup patungan.");
      return;
    }

    try {
      setSubmitting(true);
      const paidInitial = leaderIncluded ? [pjName] : [];
      const computedFinalPrice = Math.round(
        (Number(totalPrice) || 0) / finalMemberList.length
      );

      await dataService.createGroup({
        group_name: groupName.trim(),
        service_name: serviceName.trim(),
        leader_name: pjName,
        leader_phone: leaderPhone.trim(),
        price_per_person: computedFinalPrice,
        billing_day: Number(billingDay) || 1,
        member_list: finalMemberList.join(", "),
        paid_members: paidInitial,
      });

      setShowModal(false);
      // Reset form
      setGroupName("");
      setServiceName("");
      setLeaderName("");
      setLeaderPhone("");
      setTotalPrice("");
      setMemberChips([]);
      setNewMemberInput("");
      setLeaderIncluded(true);
      await loadGroups();
    } catch (err) {
      console.error(err);
      alert("Gagal mencatat grup baru.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute telemetry metrics
  const telemetry = useMemo(() => {
    let totalMembers = 0;
    let totalMonthlyPool = 0;
    groups.forEach((g) => {
      const count = g.member_list
        ? g.member_list.split(",").map((s) => s.trim()).filter(Boolean).length
        : 0;
      totalMembers += count;
      totalMonthlyPool += (Number(g.price_per_person) || 0) * (count || 1);
    });
    return { totalMembers, totalMonthlyPool };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return groups;
    const q = searchFilter.toLowerCase();
    return groups.filter(
      (g) =>
        g.group_name.toLowerCase().includes(q) ||
        g.service_name.toLowerCase().includes(q) ||
        g.leader_name.toLowerCase().includes(q)
    );
  }, [groups, searchFilter]);

  return (
    <div className="space-y-4 font-sans">
      {!currentUser ? (
        /* Auth Gate: Subscriptions are strictly managed per user */
        <div className="border border-[#26282B] bg-[#111214] p-4 sm:p-6 space-y-4 rounded-sm">
          <div className="w-12 h-12 mx-auto bg-[#FF4F00]/15 border border-[#FF4F00] text-[#FF4F00] flex items-center justify-center rounded-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto text-center">
            <span className="text-[10px] text-[#FF4F00] font-mono font-bold tracking-widest uppercase block mb-1">
              [ PRIVAT // SISTEM KREDENSIAL OPERATOR ]
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              Akses Subscription Privat
            </h1>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Setiap kelompok patungan dan subscription dikelola secara privat per akun operator. Silakan masuk atau daftarkan akun Anda terlebih dahulu untuk mengelola langganan Anda.
            </p>
          </div>

          {/* Form Login / Register */}
          <div className="max-w-sm mx-auto bg-[#0E0F11] border border-[#26282B] p-4 text-left space-y-3 rounded-sm">
            <div className="flex border border-zinc-800 p-0.5 bg-[#141517]">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthFeedback(null); }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  authMode === "login" ? "bg-[#FF4F00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthFeedback(null); }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  authMode === "register" ? "bg-[#FF4F00] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Daftar (Register)
              </button>
            </div>

            <form onSubmit={handleInlineAuthSubmit} className="space-y-3 text-xs">
              {authMode === "register" && (
                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                    Nama Operator *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Operator"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-[#141517] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operator@subscribe.local"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#141517] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 font-medium mb-1">
                  Password (min. 6 karakter) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#141517] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              {authFeedback && (
                <div
                  className={`p-2 border text-xs flex items-center gap-1.5 ${
                    authFeedback.type === "success"
                      ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                      : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                  }`}
                >
                  {authFeedback.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{authFeedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] disabled:bg-zinc-800 text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-sm"
              >
                {authLoading ? (
                  "MEMVERIFIKASI..."
                ) : authMode === "login" ? (
                  <><LogIn className="w-3.5 h-3.5" /> [ MASUK KE SUBSCRIPTION SAYA ]</>
                ) : (
                  <><User className="w-3.5 h-3.5" /> [ DAFTAR OPERATOR BARU ]</>
                )}
              </button>

              <div className="pt-2 border-t border-dashed border-zinc-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthEmail("admin@subscribe.local");
                    setAuthPassword("admin123");
                  }}
                  className="text-[10px] text-[#DFFF00] hover:underline font-mono"
                >
                  [ Gunakan Akun Demo: admin@subscribe.local / admin123 ]
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated: User owns and manages their own subscriptions */
        <>
          {/* Header */}
          <div className="border border-[#26282B] bg-[#111214] p-3 sm:p-5 relative rounded-sm">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-3 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <span className="text-[#00E676] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00E676]" /> OPERATOR: {currentUser.name} ({currentUser.email})
              </span>
              <span className="text-zinc-400 font-mono">{groups.length} Grup Terdaftar</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                  Subscription & Cluster Patungan Saya
                </h1>
                <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                  Kelola paket langganan privat Anda, checklist status lunas anggota, dan kirim pesan tagihan WhatsApp otomatis.
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 active:bg-[#ff651c] shadow-md rounded-sm"
              >
                <Plus className="w-4 h-4" /> [ + BUAT GRUP BARU ]
              </button>
            </div>

            {/* Global Rack Metrics */}
            <div className="mt-4 pt-3 border-t border-dashed border-zinc-800 grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 select-none">
              <div className="bg-[#0E0F11] border border-[#26282B] p-3 rounded-sm">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FF4F00]" /> ANGGOTA TERKELOLA
                </div>
                <div className="text-sm sm:text-base font-bold text-white tabular-nums font-mono mt-1">
                  {telemetry.totalMembers} Orang
                </div>
              </div>

              <div className="bg-[#0E0F11] border border-[#26282B] p-3 rounded-sm">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#00E676]" /> SIRKULASI / BULAN
                </div>
                <div className="text-sm sm:text-base font-bold text-[#00E676] tabular-nums font-mono mt-1">
                  {formatRupiah(telemetry.totalMonthlyPool)}
                </div>
              </div>

              <div className="hidden lg:block bg-[#0E0F11] border border-[#26282B] p-3 rounded-sm">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#DFFF00]" /> JATUH TEMPO DEKAT
                </div>
                <div className="text-sm sm:text-base font-bold text-[#DFFF00] tabular-nums font-mono mt-1">
                  {groups.filter((g) => calculateDueDays(g.billing_day).isUrgent).length} Perlu Perhatian
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          {groups.length > 0 && (
            <div className="border border-[#26282B] bg-[#111214] p-2.5 flex items-center justify-between gap-3 rounded-sm">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="CARI NAMA GRUP, LAYANAN, ATAU PENANGGUNG JAWAB..."
                className="flex-1 bg-[#0E0F11] border border-[#26282B] focus:border-[#FF4F00] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none uppercase font-mono"
              />
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                MENAMPILKAN {filteredGroups.length} DARI {groups.length}
              </span>
            </div>
          )}

          {/* Active Groups Rack */}
          {loading ? (
            <div className="border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-400 space-y-1 font-mono">
              <div>MEMUAT DATA GRUP PATUNGAN SAYA...</div>
              <div className="text-[10px] text-zinc-500">MENGAMBIL DARI REGISTRY</div>
            </div>
          ) : groups.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-10 text-center space-y-3 text-xs text-zinc-400">
              <div className="font-mono text-zinc-300">BELUM ADA SUBSCRIPTION / GRUP PATUNGAN</div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Anda belum memiliki kelompok patungan. Klik tombol di bawah untuk membuat grup langganan pertama Anda.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#FF4F00] text-black font-bold text-xs uppercase tracking-wider font-mono active:bg-[#ff651c] shadow rounded-sm"
              >
                [ + BUAT GRUP PERTAMA SAYA ]
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredGroups.map((group) => {
                const members = group.member_list
                  ? group.member_list.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
                const paidCount = Array.isArray(group.paid_members)
                  ? group.paid_members.filter((m) => members.includes(m)).length
                  : 0;
                const isSettled = members.length > 0 && paidCount === members.length;
                const dueInfo = calculateDueDays(group.billing_day);

                return (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group flex flex-col justify-between bg-[#111214] border border-[#26282B] hover:border-[#FF4F00] p-4 relative transition-colors overflow-hidden active:bg-[#16181B] rounded-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#DFFF00] uppercase tracking-wider font-mono font-bold block truncate">
                            {group.service_name}
                          </span>
                          <h2 className="text-base font-bold text-white group-hover:text-[#FF4F00] font-sans mt-0.5 truncate">
                            {group.group_name}
                          </h2>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-[#00E676] tabular-nums font-mono">
                            {formatRupiah(group.price_per_person)}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-mono uppercase">/ orang / bln</div>
                        </div>
                      </div>

                      {/* Progress bar and status strip */}
                      <div className="mt-3.5 pt-3 border-t border-dashed border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="flex items-center gap-1.5 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#FF4F00] shrink-0" />
                            PJ: <strong className="text-white font-medium truncate">{group.leader_name}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 border text-[10px] font-mono font-bold shrink-0 ${
                              isSettled
                                ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                                : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                            }`}
                          >
                            {isSettled ? "LUNAS LENGKAP" : `${paidCount}/${members.length} LUNAS`}
                          </span>
                        </div>

                        {/* Schedule Bar with accurate calendar days */}
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <span>
                            Anggota: <strong className="text-zinc-200">{members.length} orang</strong>
                          </span>
                          <span
                            className={`flex items-center gap-1 font-bold ${
                              dueInfo.isUrgent ? "text-[#FF4F00]" : "text-[#DFFF00]"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Tgl {group.billing_day} ({dueInfo.label})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inspect Action Footer */}
                    <div className="mt-3.5 pt-2.5 border-t border-[#26282B] flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span className="text-[10px] text-zinc-500">ID: {group.id.slice(0, 8)}</span>
                      <span className="flex items-center text-[#FF4F00] font-bold group-hover:translate-x-0.5 transition-transform">
                        Kelola Grup <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Compact Initializer Modal (max-h-[65vh] + mb-16 for mobile tab bar clearance) */}
          {showModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-[#121316] border border-[#2D3035] w-full max-w-lg max-h-[65vh] sm:max-h-[82vh] mb-16 sm:mb-0 flex flex-col shadow-2xl rounded-sm">
                <div className="shrink-0 p-3.5 sm:p-4 border-b border-[#26282B] flex items-center justify-between">
                  <div>
                    <span className="text-[#FF4F00] font-mono font-bold text-sm block">
                      [ BUAT CLUSTER PATUNGAN BARU ]
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Dikelola di bawah akun: {currentUser.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                    title="Tutup Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
                    {/* 1. Nama Grup / Subscription */}
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
                          Nama Grup / Subscription *
                        </label>
                        <span className="text-[10px] text-zinc-400">Julukan custom</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Spotify Bareng Kosan, Netflix Family Circle"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-[#0E0F11] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs placeholder-zinc-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        Beri nama kelompok patungan ini agar mudah dikenali.
                      </span>
                    </div>

                    {/* 2. Pilihan Layanan Digital */}
                    <div className="p-3 bg-[#0E0F11] border border-[#26282B] space-y-3">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
                            Pilih dari Katalog Layanan
                          </label>
                          <span className="text-[10px] text-[#00E676] font-mono">1 Layanan Dipilih</span>
                        </div>

                        <select
                          onChange={handleServiceSelectChange}
                          defaultValue=""
                          className="w-full bg-[#141517] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-zinc-200 text-xs focus:outline-none transition-colors"
                        >
                          <option value="">-- Pilih Layanan dari Katalog --</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} — {formatRupiah(s.monthly_price)} / bln ({s.max_slots} slot)
                            </option>
                          ))}
                          <option value="custom">-- Layanan Kustom / Lainnya (Ketik Manual) --</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                          Nama Layanan Resmi / Kustom *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Spotify Premium Family, Netflix Premium 4K"
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                          className="w-full bg-[#141517] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs placeholder-zinc-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* 3. Data PJ (Penanggung Jawab) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#FF4F00]" /> Penanggung Jawab (PJ) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nama Anda (e.g. Budi Santoso)"
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          className="w-full bg-[#0E0F11] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs placeholder-zinc-600 focus:outline-none transition-colors"
                        />
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="leaderInc"
                            checked={leaderIncluded}
                            onChange={(e) => setLeaderIncluded(e.target.checked)}
                            className="accent-[#FF4F00] cursor-pointer w-3.5 h-3.5"
                          />
                          <label htmlFor="leaderInc" className="text-[11px] text-zinc-300 cursor-pointer">
                            PJ ikut langganan (masuk hitungan slot)
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#00E676]" /> No. WhatsApp PJ (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="6281234567890"
                          value={leaderPhone}
                          onChange={handlePhoneChange}
                          className={`w-full bg-[#0E0F11] border px-3 py-2 text-white text-xs font-mono placeholder-zinc-600 focus:outline-none transition-colors ${
                            phoneError ? "border-rose-500" : "border-[#2D3035] focus:border-[#FF4F00]"
                          }`}
                        />
                        {phoneError ? (
                          <span className="text-[10px] text-rose-400 block mt-1">{phoneError}</span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 block mt-1">
                            Format 628xxx (digunakan untuk template pesan tagihan)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4. Total Tarif & Tanggal Jatuh Tempo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1">
                          Total Biaya Bulanan (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Contoh: 186000"
                          value={totalPrice}
                          onChange={(e) => setTotalPrice(e.target.value)}
                          className="w-full bg-[#0E0F11] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs font-mono placeholder-zinc-600 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wide mb-1">
                          Tgl Jatuh Tempo Bulanan (1-31) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          required
                          value={billingDay}
                          onChange={(e) => setBillingDay(e.target.value)}
                          className="w-full bg-[#0E0F11] border border-[#2D3035] focus:border-[#FF4F00] px-3 py-2 text-white text-xs font-mono placeholder-zinc-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* 5. Anggota Patungan Roster */}
                    <div className="border border-[#26282B] bg-[#0E0F11] p-3 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wide">
                          <Users className="w-3.5 h-3.5 text-[#FF4F00]" /> Anggota Roster ({activeRoster.length} Orang)
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">Pisahkan dengan koma</span>
                      </div>

                      {/* Chips Container */}
                      <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-[#141517] border border-[#26282B]">
                        {leaderIncluded && (
                          <div className="px-2 py-1 bg-[#FF4F00]/15 border border-[#FF4F00] text-[#FF4F00] text-xs font-medium flex items-center gap-1.5 rounded-sm">
                            <span>[PJ] {leaderName.trim() || "Penanggung Jawab"}</span>
                            <button
                              type="button"
                              onClick={() => setLeaderIncluded(false)}
                              className="text-zinc-400 hover:text-white"
                              title="Keluarkan PJ dari daftar patungan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {memberChips.map((m, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 rounded-sm"
                          >
                            <span>{m}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberChip(m)}
                              className="text-zinc-400 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {activeRoster.length === 0 && (
                          <span className="text-xs text-zinc-400 self-center">
                            Belum ada anggota. Centang PJ atau masukkan nama teman di bawah.
                          </span>
                        )}
                      </div>

                      {/* Input new member */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ketik nama teman (e.g. Andi Pratama)..."
                          value={newMemberInput}
                          onChange={(e) => setNewMemberInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddMemberChip();
                            }
                          }}
                          className="flex-1 bg-[#141517] border border-[#2D3035] px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddMemberChip}
                          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-[#FF4F00] hover:text-black border border-zinc-700 text-zinc-200 text-xs font-bold uppercase shrink-0 transition-colors rounded-sm"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>

                    {/* 6. Dynamic Calculation Display */}
                    <div className="lcd-screen p-3 space-y-2 select-none border border-zinc-800 rounded-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300">Total Biaya Bulanan:</span>
                        <span className="text-white font-bold font-mono tabular-nums">
                          {formatRupiah(Number(totalPrice) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300">Jumlah Slot Anggota:</span>
                        <span className="text-[#DFFF00] font-bold font-mono tabular-nums">
                          {activeRoster.length} Orang {leaderIncluded ? "(Termasuk PJ)" : "(Tanpa PJ)"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-dashed border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                          Biaya Patungan per Orang:
                        </span>
                        <span className="text-sm font-bold text-[#00E676] font-mono tabular-nums">
                          {formatRupiah(calculatedPricePerPerson)} / bulan
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pinned Sticky Footer */}
                  <div className="shrink-0 p-3 border-t border-[#26282B] bg-[#0E0F11]">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] disabled:bg-zinc-800 text-black font-bold font-mono uppercase tracking-wider text-xs transition-colors rounded-sm shadow-md"
                    >
                      {submitting ? "MENYIMPAN GRUP..." : "[ COMMIT // SIMPAN GRUP PATUNGAN ]"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

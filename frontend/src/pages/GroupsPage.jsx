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
  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

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
      setLoading(true);
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
  }, [loadGroups]);

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

    if (!validateIndonesianPhone(leaderPhone)) {
      alert("Nomor WhatsApp PJ wajib menggunakan format 628xxx (10-15 digit).");
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
    <div className="space-y-4 font-mono">
      {/* Telemetry Header */}
      <div className="border border-[#26282B] bg-[#111214] p-3 sm:p-4 relative bracket-frame">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-2 text-[9px] uppercase tracking-wider text-zinc-400">
          <span className="text-[#00E676] flex items-center gap-1.5 font-bold">
            <Cpu className="w-3.5 h-3.5" /> SEC.02 // SPLIT_RACK_TELEMETRY
          </span>
          <span className="text-zinc-400">RACKS: {groups.length} NODES_ACTIVE</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-sans uppercase">
              Cluster Grup Patungan
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
              Kelola cluster patungan akun, checklist pembayaran rutin bulanan & broadcast WhatsApp otomatis.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 active:bg-[#ff651c] shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> [ INITIALIZE_NEW_RACK ]
          </button>
        </div>

        {/* Global Rack Metrics */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-zinc-800 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 select-none">
          <div className="bg-[#0E0F11] border border-[#26282B] p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-[#FF4F00]" /> ANGGOTA TERKELOLA
              </div>
              <div className="text-xs sm:text-sm font-bold text-white tabular-nums mt-0.5">
                {telemetry.totalMembers} HEADS
              </div>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">POOLED</div>
          </div>

          <div className="bg-[#0E0F11] border border-[#26282B] p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#00E676]" /> SIRKULASI / BULAN
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#00E676] tabular-nums mt-0.5">
                {formatRupiah(telemetry.totalMonthlyPool)}
              </div>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">FLOW</div>
          </div>

          <div className="hidden lg:flex bg-[#0E0F11] border border-[#26282B] p-2.5 items-center justify-between">
            <div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#DFFF00]" /> JATUH TEMPO AKTIF
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#DFFF00] tabular-nums mt-0.5">
                {groups.filter((g) => calculateDueDays(g.billing_day).isUrgent).length} SEGERA
              </div>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">CYCLE</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {groups.length > 0 && (
        <div className="border border-[#26282B] bg-[#111214] p-2.5 flex items-center justify-between gap-3">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="FILTER CLUSTER RACK..."
            className="flex-1 bg-[#0E0F11] border border-[#26282B] focus:border-[#FF4F00] px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none uppercase"
          />
          <span className="text-[9px] text-zinc-400 hidden sm:inline">
            SHOWING: {filteredGroups.length} OF {groups.length}
          </span>
        </div>
      )}

      {/* Active Groups Rack */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-500 space-y-1">
          <div>SCANNING_RACK_NODES...</div>
          <div className="text-[10px] text-zinc-600">POLLING_NODES</div>
        </div>
      ) : groups.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center space-y-3 text-xs text-zinc-500">
          <div>NO_ACTIVE_GROUPS_REGISTERED</div>
          <p className="text-[10px] text-zinc-600 max-w-xs mx-auto">
            Buat cluster patungan pertama untuk memantau anggota, tanggal jatuh tempo, dan checklist pembayaran.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-[#FF4F00] text-black font-bold text-[10px] uppercase tracking-wider active:bg-[#ff651c]"
          >
            [ INITIALIZE FIRST GROUP &gt; ]
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
                className="apparatus-card group flex flex-col justify-between bg-[#111214] border border-[#26282B] lg:hover:border-[#FF4F00] p-3.5 sm:p-4 relative transition-colors overflow-hidden active:bg-[#16181B]"
              >
                {/* Desktop hover scanline bar */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF4F00] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-150" />

                <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00]">
                  +
                </div>
                <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00]">
                  +
                </div>

                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] text-[#DFFF00] uppercase tracking-wider font-bold">
                        {group.service_name}
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-white lg:group-hover:text-[#FF4F00] font-sans mt-0.5">
                        {group.group_name}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-[#00E676] tabular-nums">
                        {formatRupiah(group.price_per_person)}
                      </div>
                      <div className="text-[9px] text-zinc-400 uppercase">/ KEPALA / BLN</div>
                    </div>
                  </div>

                  {/* Progress bar and status strip */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#FF4F00]" />
                        PJ: <strong className="text-zinc-200">{group.leader_name}</strong>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 border text-[9px] font-bold ${
                          isSettled
                            ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                            : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                        }`}
                      >
                        {isSettled ? "LUNAS LENGKAP" : `${paidCount}/${members.length} LUNAS`}
                      </span>
                    </div>

                    {/* Schedule Bar with accurate calendar days */}
                    <div className="flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="text-zinc-400">
                        ROSTER: <strong className="text-zinc-300">{members.length} ORANG</strong>
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          dueInfo.isUrgent ? "text-[#FF4F00]" : "text-[#DFFF00]"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        TGL {group.billing_day} ({dueInfo.label})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inspect Action Footer */}
                <div className="mt-3 pt-2 border-t border-[#26282B] flex items-center justify-between text-[9px] text-zinc-400">
                  <span>ID: {group.id.slice(0, 8)}</span>
                  <span className="flex items-center text-[#FF4F00] font-bold lg:group-hover:translate-x-1 transition-transform">
                    [ INSPECT_RACK ] <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Industrial Apparatus Initializer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111214] border-2 border-[#26282B] w-full max-w-lg p-4 sm:p-5 space-y-3.5 max-h-[92vh] overflow-y-auto bracket-frame">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
              <span className="text-[#FF4F00] font-bold text-sm">
                [ RACK_INITIALIZER // REGISTRASI_CLUSTER ]
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 lg:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Nama Grup & Layanan */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  NAMA CLUSTER PATUNGAN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Kosan Bareng"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  NAMA LAYANAN DIGITAL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
                {services.length > 0 && (
                  <div className="flex gap-1 overflow-x-auto pt-1.5 scrollbar-none">
                    {services.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setServiceName(s.name);
                          setTotalPrice(s.monthly_price.toString());
                        }}
                        className="text-[9px] px-2 py-0.5 bg-[#0E0F11] border border-zinc-800 text-zinc-300 lg:hover:text-white shrink-0 active:bg-zinc-800"
                      >
                        + {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data PJ (Leader) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#FF4F00]" /> PENANGGUNG JAWAB (PJ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="leaderInc"
                      checked={leaderIncluded}
                      onChange={(e) => setLeaderIncluded(e.target.checked)}
                      className="accent-[#FF4F00] cursor-pointer"
                    />
                    <label htmlFor="leaderInc" className="text-[9px] text-zinc-400 cursor-pointer">
                      PJ ikut langganan (masuk daftar patungan)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#00E676]" /> NO. WHATSAPP PJ (WAJIB 628xxx) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="6281234567890"
                    value={leaderPhone}
                    onChange={handlePhoneChange}
                    className={`w-full bg-[#0E0F11] border px-3 py-1.5 text-white focus:outline-none ${
                      phoneError ? "border-rose-500" : "border-[#26282B] focus:border-[#FF4F00]"
                    }`}
                  />
                  {phoneError ? (
                    <span className="text-[9px] text-rose-400 block mt-0.5">
                      {phoneError}
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-0.5">
                      Otomatis distandarisasi ke format 628xxx
                    </span>
                  )}
                </div>
              </div>

              {/* Total Tarif Langganan Bulanan & Tanggal Jatuh Tempo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TOTAL BIAYA RESMI BULANAN (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="186000"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                  <span className="text-[9px] text-zinc-500 block mt-0.5">
                    Web otomatis membagi rata ke anggota
                  </span>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TGL JATUH TEMPO SETIAP BULAN (1-31) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              {/* Enhanced Member Tag / Chip Editor */}
              <div className="border border-[#26282B] bg-[#0E0F11] p-3 space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase text-zinc-400">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#FF4F00]" /> DAFTAR ANGGOTA ROSTER ({activeRoster.length} ORANG)
                  </span>
                  <span className="text-[#DFFF00]">TEKAN ENTER / TAMBAH</span>
                </div>

                {/* Chips Container */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#141517] border border-[#26282B]">
                  {leaderIncluded && (
                    <div className="px-2 py-0.5 bg-[#FF4F00]/20 border border-[#FF4F00] text-[#FF4F00] text-[10px] flex items-center gap-1.5">
                      <span className="font-bold">
                        [PJ] {leaderName.trim() || "Penanggung Jawab"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLeaderIncluded(false)}
                        className="text-zinc-400 hover:text-white"
                        title="Keluarkan PJ dari daftar patungan"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {memberChips.map((m, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1.5"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberChip(m)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {activeRoster.length === 0 && (
                    <span className="text-[10px] text-zinc-600 self-center">
                      Belum ada anggota. Centang PJ atau masukkan nama teman di bawah.
                    </span>
                  )}
                </div>

                {/* Input new member */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik nama anggota (e.g. Andi Pratama)..."
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddMemberChip();
                      }
                    }}
                    className="flex-1 bg-[#111214] border border-[#26282B] px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMemberChip}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-[#FF4F00] hover:text-black border border-zinc-700 text-zinc-200 text-[10px] uppercase font-bold shrink-0 transition-colors"
                  >
                    + TAMBAH
                  </button>
                </div>
              </div>

              {/* Dynamic Telemetry Calculation Display */}
              <div className="lcd-screen p-3 border border-zinc-800 space-y-1.5 select-none">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-400">TOTAL BIAYA BULANAN:</span>
                  <span className="text-white font-bold tabular-nums">
                    {formatRupiah(Number(totalPrice) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-400">JUMLAH ANGGOTA:</span>
                  <span className="text-[#DFFF00] font-bold tabular-nums">
                    {activeRoster.length} ORANG {leaderIncluded ? "(TERMASUK PJ)" : "(TANPA PJ)"}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-dashed border-zinc-800 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">
                    TARIF OTOMATIS PER KEPALA:
                  </span>
                  <span className="text-sm font-bold text-[#00E676] tabular-nums">
                    {formatRupiah(calculatedPricePerPerson)} / bln
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#FF4F00] lg:hover:bg-[#ff651c] disabled:bg-zinc-800 text-black font-bold uppercase tracking-wider text-xs transition-colors mt-2 active:bg-[#ff651c] shadow-lg"
              >
                {submitting ? "RECORDING_RACK..." : "[ COMMIT_NEW_GROUP ]"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

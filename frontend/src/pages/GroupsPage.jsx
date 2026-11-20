import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cpu, Plus, Calendar, ShieldCheck, X, Users, Wallet, ArrowUpRight } from "lucide-react";
import { dataService } from "../services/dataService";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

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
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [billingDay, setBillingDay] = useState(1);
  const [memberList, setMemberList] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.prefillServiceName) {
      setServiceName(location.state.prefillServiceName);
      if (location.state.prefillPrice) {
        setPricePerPerson(location.state.prefillPrice.toString());
      }
      setShowModal(true);
    }
  }, [location.state]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || !serviceName || !leaderName || !leaderPhone) {
      alert("Field wajib belum terisi.");
      return;
    }

    try {
      setSubmitting(true);
      await dataService.createGroup({
        group_name: groupName.trim(),
        service_name: serviceName.trim(),
        leader_name: leaderName.trim(),
        leader_phone: leaderPhone.trim(),
        price_per_person: Number(pricePerPerson) || 0,
        billing_day: Number(billingDay) || 1,
        member_list: memberList.trim(),
      });

      setShowModal(false);
      setGroupName("");
      setServiceName("");
      setLeaderName("");
      setLeaderPhone("");
      setPricePerPerson("");
      setMemberList("");
      await loadGroups();
    } catch (err) {
      console.error(err);
      alert("Gagal mencatat grup baru.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = useCallback((val) => currencyFormatter.format(val), []);

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

  const currentDay = new Date().getDate();

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
            className="px-3 py-2 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 active:bg-[#ff651c]"
          >
            <Plus className="w-3.5 h-3.5" /> [ INITIALIZE_NEW_RACK ]
          </button>
        </div>

        {/* Global Rack Metrics (Responsive 3-grid on Desktop) */}
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
            <div className="text-[9px] text-zinc-400 font-mono">POOLED</div>
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
            <div className="text-[9px] text-zinc-400 font-mono">FLOW</div>
          </div>

          <div className="hidden lg:flex bg-[#0E0F11] border border-[#26282B] p-2.5 items-center justify-between">
            <div>
              <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#DFFF00]" /> JATUH TEMPO AKTIF
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#DFFF00] tabular-nums mt-0.5">
                {groups.filter((g) => Math.abs(g.billing_day - currentDay) <= 3).length} SEGERA
              </div>
            </div>
            <div className="text-[9px] text-zinc-400 font-mono">CYCLE</div>
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

      {/* Active Groups Rack (Responsive Grid with content-visibility containment) */}
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

            // Due date calculation
            const diffDays = group.billing_day - currentDay;
            const dueLabel =
              diffDays === 0
                ? "DUE TODAY!"
                : diffDays > 0
                ? `${diffDays} HARI LAGI`
                : `${30 + diffDays} HARI LAGI`;

            return (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="apparatus-card group flex flex-col justify-between bg-[#111214] border border-[#26282B] lg:hover:border-[#FF4F00] p-3.5 sm:p-4 relative transition-colors overflow-hidden active:bg-[#16181B]"
              >
                {/* Desktop hover scanline bar (Desktop only) */}
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

                    {/* Schedule Bar */}
                    <div className="flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="text-zinc-400">
                        ROSTER: <strong className="text-zinc-300">{members.length} ORANG</strong>
                      </span>
                      <span className="flex items-center gap-1 text-[#DFFF00]">
                        <Calendar className="w-3 h-3" />
                        TGL {group.billing_day} ({dueLabel})
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

      {/* Industrial Apparatus Initializer Modal (Solid Opaque, Zero Backdrop Blur) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111214] border-2 border-[#26282B] w-full max-w-lg p-4 sm:p-5 space-y-3.5 max-h-[92vh] overflow-y-auto bracket-frame">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
              <span className="text-[#FF4F00] font-bold text-sm">
                [ RACK_INITIALIZER // FORM_REGISTRASI ]
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 lg:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  NAMA GRUP / CLUSTER PATUNGAN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Kosan Tembalang"
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
                          setPricePerPerson(
                            Math.round(s.monthly_price / (s.max_slots || 1)).toString()
                          );
                        }}
                        className="text-[9px] px-2 py-0.5 bg-[#0E0F11] border border-zinc-800 text-zinc-300 lg:hover:text-white shrink-0"
                      >
                        + {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    NAMA PENANGGUNG JAWAB (PJ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    NO. WHATSAPP PJ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="62812345678"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TARIF / ORANG (RP)
                  </label>
                  <input
                    type="number"
                    placeholder="46500"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TGL JATUH TEMPO (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  ROSTER ANGGOTA (PISAHKAN DENGAN KOMA)
                </label>
                <input
                  type="text"
                  placeholder="Budi, Andi, Siti, Rizky"
                  value={memberList}
                  onChange={(e) => setMemberList(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#FF4F00] lg:hover:bg-[#ff651c] disabled:bg-zinc-800 text-black font-bold uppercase tracking-wider text-xs transition-colors mt-2 active:bg-[#ff651c]"
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

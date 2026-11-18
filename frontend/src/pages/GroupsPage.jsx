import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cpu, Plus, Calendar, ShieldCheck, X, ChevronRight } from "lucide-react";

export default function GroupsPage() {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [billingDay, setBillingDay] = useState(1);
  const [memberList, setMemberList] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (location.state?.prefillServiceName) {
      setServiceName(location.state.prefillServiceName);
      setShowModal(true);
    }
  }, [location.state]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/groups`);
      const result = await res.json();
      if (result.success) setGroups(result.data || []);
    } catch (err) {
      console.error("Gagal memuat grup:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || !serviceName || !leaderName || !leaderPhone) {
      alert("Field wajib belum terisi.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          service_name: serviceName,
          leader_name: leaderName,
          leader_phone: leaderPhone,
          price_per_person: Number(pricePerPerson) || 0,
          billing_day: Number(billingDay) || 1,
          member_list: memberList
        })
      });

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        setGroupName("");
        setServiceName("");
        setLeaderName("");
        setLeaderPhone("");
        setPricePerPerson("");
        setMemberList("");
        fetchGroups();
      } else {
        alert(result.message || "Gagal membuat grup.");
      }
    } catch (err) {
      console.error(err);
      alert("Error jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 space-y-4 font-mono">
      {/* Header Panel */}
      <div className="border border-[#26282B] bg-[#111214] p-3">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-2 text-[9px] uppercase tracking-wider text-zinc-400">
          <span className="text-[#00E676] flex items-center gap-1.5 font-bold">
            <Cpu className="w-3.5 h-3.5" /> SEC.02 // SPLIT_RACK_TELEMETRY
          </span>
          <span className="text-zinc-500">ACTIVE: {groups.length}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white font-sans uppercase">
              Grup Patungan Aktif
            </h1>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Kelola cluster patungan akun & jadwal penagihan rutin.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1.5 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> [ NEW_RACK ]
          </button>
        </div>
      </div>

      {/* Groups Rack */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
          SCANNING_RACK_NODES...
        </div>
      ) : groups.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-8 text-center space-y-2 text-xs text-zinc-500">
          <p>NO_ACTIVE_GROUPS_REGISTERED</p>
          <button onClick={() => setShowModal(true)} className="text-[#FF4F00] underline">
            INITIALIZE FIRST GROUP &gt;
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group block bg-[#111214] border border-[#26282B] hover:border-[#FF4F00] p-3.5 relative transition-colors"
            >
              <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600">+</div>
              <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600">+</div>

              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-[9px] text-[#DFFF00] uppercase tracking-wider font-bold">
                    {group.service_name}
                  </div>
                  <h2 className="text-sm font-bold text-white group-hover:text-[#FF4F00] transition-colors font-sans mt-0.5">
                    {group.group_name}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#00E676] tabular-nums">
                    {formatRupiah(group.price_per_person)}
                  </div>
                  <div className="text-[8px] text-zinc-500">/ MEMBER / MO</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-400">
                  <ShieldCheck className="w-3 h-3 text-zinc-500" /> PJ: {group.leader_name}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Calendar className="w-3 h-3 text-[#FF4F00]" /> DUE_DATE: {group.billing_day}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Industrial Apparatus Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111214] border-2 border-[#26282B] w-full max-w-sm p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
              <span className="text-[#FF4F00] font-bold">[ RACK_INITIALIZER ]</span>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">GROUP_NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Kosan Undip"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">SERVICE_NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">PJ_NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Budi"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">PJ_WHATSAPP *</label>
                  <input
                    type="text"
                    required
                    placeholder="62812345678"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">TARIFF / MEMBER (RP)</label>
                  <input
                    type="number"
                    placeholder="46500"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">DUE_DATE (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-400 mb-1">MEMBER_ROSTER (COMMA_SEPARATED)</label>
                <input
                  type="text"
                  placeholder="Budi, Andi, Siti, Rizky"
                  value={memberList}
                  onChange={(e) => setMemberList(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] disabled:bg-zinc-800 text-black font-bold uppercase tracking-wider text-xs transition-colors mt-2"
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

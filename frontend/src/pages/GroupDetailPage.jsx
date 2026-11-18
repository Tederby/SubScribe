import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Calendar, Phone, User, Send, Radio } from "lucide-react";

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchGroup() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/groups/${id}`);
        const result = await res.json();
        if (result.success) setGroup(result.data);
      } catch (err) {
        console.error("Gagal memuat detail grup:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [id, API_URL]);

  const handleDelete = async () => {
    if (!confirm("Konfirmasi terminasi cluster patungan ini?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/api/groups/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        navigate("/groups");
      } else {
        alert(result.message || "Gagal menghapus grup.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setDeleting(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500">
        INITIALIZING_GROUP_INSPECTOR...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 text-center space-y-3 font-mono">
        <p className="text-xs text-[#FF4F00]">ERROR: GROUP_NODE_NOT_FOUND</p>
        <Link to="/groups" className="text-xs text-zinc-400 hover:text-white underline">
          &lt; RETURN_TO_RACK
        </Link>
      </div>
    );
  }

  const members = group.member_list
    ? group.member_list.split(",").map((m) => m.trim()).filter(Boolean)
    : [];

  const generateWaLink = (memberName = "") => {
    const greeting = memberName ? `Halo ${memberName}!` : "Halo!";
    const text = `${greeting} Jangan lupa bayar patungan *${group.service_name}* untuk grup *${group.group_name}* bulan ini sebesar *${formatRupiah(group.price_per_person)}* ya (Jatuh tempo tgl ${group.billing_day}). Transfer ke ${group.leader_name} (${group.leader_phone}). Makasih!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="p-4 space-y-4 font-mono">
      {/* Return & Control Bar */}
      <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
        <div className="flex items-center gap-2">
          <Link
            to="/groups"
            className="px-2 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 hover:text-white hover:border-[#FF4F00] flex items-center gap-1 text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> [ ESC ]
          </Link>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            INSPECTOR // {group.id.slice(0, 8)}
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 bg-[#111214] border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
          title="Terminate Group"
        >
          <Trash2 className="w-3.5 h-3.5" /> [ PURGE ]
        </button>
      </div>

      {/* Main Spec Card */}
      <div className="border border-[#26282B] bg-[#111214] p-4 space-y-3 relative">
        <div className="absolute top-1 left-2 text-[8px] text-zinc-600">+</div>
        <div className="absolute top-1 right-2 text-[8px] text-zinc-600">+</div>

        <div className="flex justify-between items-start border-b border-dashed border-zinc-800 pb-3">
          <div>
            <span className="text-[9px] text-[#DFFF00] font-bold uppercase tracking-wider">
              CLUSTER_NODE // {group.service_name}
            </span>
            <h1 className="text-base font-bold text-white font-sans mt-0.5">
              {group.group_name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 block">TARIFF_PER_HEAD</span>
            <span className="text-sm font-bold text-[#00E676] tabular-nums">
              {formatRupiah(group.price_per_person)}
            </span>
          </div>
        </div>

        {/* Telemetry specs */}
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <User className="w-3 h-3 text-[#FF4F00]" /> CONTROLLER (PJ):
            </span>
            <span className="text-white font-bold">{group.leader_name}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Phone className="w-3 h-3 text-[#FF4F00]" /> WA_CONTACT:
            </span>
            <span className="text-zinc-200">{group.leader_phone}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="w-3 h-3 text-[#FF4F00]" /> CYCLE_SCHEDULE:
            </span>
            <span className="text-[#DFFF00]">Tgl {group.billing_day} / bln</span>
          </div>
        </div>
      </div>

      {/* Member Roster & Individual WA Dispatch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Radio className="w-3.5 h-3.5 text-[#00E676]" /> ALLOCATED_MEMBERS
          </span>
          <span className="text-zinc-500">{members.length} HEADS</span>
        </div>

        {members.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            NO_MEMBERS_ASSIGNED_TO_CLUSTER
          </div>
        ) : (
          <div className="space-y-1.5">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="bg-[#111214] border border-[#26282B] p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-600">[{idx + 1}]</span>
                  <span className="text-white font-sans font-medium">{member}</span>
                </div>

                <a
                  href={generateWaLink(member)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-zinc-800 hover:bg-[#00E676] hover:text-black border border-zinc-700 text-[10px] uppercase tracking-wider text-[#00E676] flex items-center gap-1 transition-colors font-bold"
                >
                  <Send className="w-3 h-3" /> [ DISPATCH_WA ]
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Hardware Broadcast CTA */}
      <a
        href={generateWaLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 px-4 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-mono font-bold text-xs uppercase tracking-widest text-center transition-all active:scale-[0.99]"
      >
        [ BROADCAST_BILLING_DISPATCH_WA ]
      </a>
    </div>
  );
}

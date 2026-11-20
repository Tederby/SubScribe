import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Phone,
  User,
  Send,
  Radio,
  CheckCircle2,
  Clock,
  Plus,
  MessageSquare,
} from "lucide-react";
import { dataService } from "../services/dataService";

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [messageMode, setMessageMode] = useState("routine"); // 'routine' | 'urgent' | 'receipt'

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await dataService.getGroupById(id);
      setGroup(data);
    } catch (err) {
      console.error("Gagal memuat detail grup:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Konfirmasi terminasi cluster "${group.group_name}"? Data akan dihapus.`)) return;
    try {
      setDeleting(true);
      await dataService.deleteGroup(id);
      navigate("/groups");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus grup.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePayment = (memberName) => {
    const updated = dataService.toggleMemberPayment(group.id, memberName);
    if (updated) {
      setGroup((prev) => ({ ...prev, paid_members: updated }));
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const updated = dataService.addMemberToGroup(group.id, newMemberName.trim());
    if (updated) {
      setGroup(updated);
      setNewMemberName("");
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500 space-y-2">
        <div className="animate-pulse">INITIALIZING_GROUP_INSPECTOR...</div>
        <div className="text-[10px] text-zinc-600">INSPECTING_NODE</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 text-center space-y-3 font-mono">
        <p className="text-xs text-[#FF4F00] font-bold">ERROR: GROUP_NODE_NOT_FOUND</p>
        <Link
          to="/groups"
          className="inline-block px-3 py-1.5 bg-[#111214] border border-[#26282B] text-xs text-zinc-400 hover:text-white"
        >
          [ &lt; RETURN_TO_RACK ]
        </Link>
      </div>
    );
  }

  const members = group.member_list
    ? group.member_list.split(",").map((m) => m.trim()).filter(Boolean)
    : [];

  const paidMembers = group.paid_members || [];
  const paidCount = members.filter((m) => paidMembers.includes(m)).length;
  const totalTarget = (Number(group.price_per_person) || 0) * members.length;
  const totalCollected = (Number(group.price_per_person) || 0) * paidCount;
  const percentCollected = members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0;

  const generateWaMessage = (targetName = "") => {
    const greeting = targetName ? `Halo ${targetName}!` : "Halo teman-teman!";
    const tariff = formatRupiah(group.price_per_person);

    if (messageMode === "urgent") {
      return `${greeting} PEMBERITAHUAN: Hari ini jatuh tempo pembayaran patungan *${group.service_name}* (*${group.group_name}*) sebesar *${tariff}*. Tolong segera transfer ke *${group.leader_name}* (${group.leader_phone}) agar akun bersama tidak terputus. Terima kasih!`;
    }
    if (messageMode === "receipt") {
      return `${greeting} KONFIRMASI: Pembayaran patungan *${group.service_name}* sebesar *${tariff}* telah diterima lunas oleh *${group.leader_name}*. Akun aktif untuk periode ini. Terima kasih atas kerjasamanya!`;
    }
    // Default routine reminder
    return `${greeting} Pengingat patungan langganan *${group.service_name}* (*${group.group_name}*) untuk bulan ini sebesar *${tariff}* (Jatuh tempo tgl ${group.billing_day}). Mohon transfer ke *${group.leader_name}* (${group.leader_phone}). Makasih!`;
  };

  const getWaLink = (targetName = "") => {
    const msg = generateWaMessage(targetName);
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="p-3.5 space-y-3 font-mono">
      {/* Return & Purge Control Bar */}
      <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
        <div className="flex items-center gap-2">
          <Link
            to="/groups"
            className="px-2 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 hover:text-white hover:border-[#FF4F00] flex items-center gap-1 text-[10px] uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> [ ESC / GRUP ]
          </Link>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            NODE // {group.id.slice(0, 8)}
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 bg-[#111214] border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
          title="Terminate Cluster"
        >
          <Trash2 className="w-3.5 h-3.5" /> [ PURGE_RACK ]
        </button>
      </div>

      {/* Main Cluster Spec Card */}
      <div className="border border-[#26282B] bg-[#111214] p-3.5 space-y-3 relative bracket-frame">
        <div className="absolute top-1 left-2 text-[8px] text-zinc-600">+</div>
        <div className="absolute top-1 right-2 text-[8px] text-zinc-600">+</div>

        <div className="flex justify-between items-start border-b border-dashed border-zinc-800 pb-2.5">
          <div>
            <span className="text-[9px] text-[#DFFF00] font-bold uppercase tracking-wider">
              CLUSTER_NODE // {group.service_name}
            </span>
            <h1 className="text-base font-bold text-white font-sans mt-0.5">
              {group.group_name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-zinc-500 block uppercase">TARIF / KEPALA</span>
            <span className="text-sm font-bold text-[#00E676] tabular-nums">
              {formatRupiah(group.price_per_person)}
            </span>
          </div>
        </div>

        {/* Telemetry specs grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <User className="w-3 h-3 text-[#FF4F00]" />
              <span className="text-zinc-500">PJ:</span>
              <strong className="text-white">{group.leader_name}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Phone className="w-3 h-3 text-[#00E676]" />
              <span className="text-zinc-500">WA:</span>
              <span className="text-zinc-300">{group.leader_phone}</span>
            </div>
          </div>

          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end gap-1 text-zinc-400">
              <Calendar className="w-3 h-3 text-[#DFFF00]" />
              <span className="text-zinc-500">JATUH TEMPO:</span>
              <strong className="text-[#DFFF00]">Tgl {group.billing_day}</strong>
            </div>
            <div className="text-[9px] text-zinc-500">
              POOL: <span className="text-white tabular-nums">{formatRupiah(totalTarget)}</span>
            </div>
          </div>
        </div>

        {/* Financial Settlement Progress Meter */}
        <div className="pt-2 border-t border-dashed border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-[9px]">
            <span className="text-zinc-400 uppercase">
              STATUS SETTLEMENT BULAN INI:
            </span>
            <span className="text-[#00E676] font-bold tabular-nums">
              {formatRupiah(totalCollected)} / {formatRupiah(totalTarget)} ({percentCollected}%)
            </span>
          </div>

          <div className="w-full bg-[#0E0F11] border border-zinc-800 h-2 flex">
            <div
              className="bg-[#00E676] transition-all duration-300"
              style={{ width: `${percentCollected}%` }}
            />
          </div>
        </div>
      </div>

      {/* Member Roster & Individual Checklist */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Radio className="w-3.5 h-3.5 text-[#00E676]" /> CHECKLIST ANGGOTA & STATUS BAYAR
          </span>
          <span className="text-zinc-400 tabular-nums">
            {paidCount} / {members.length} LUNAS
          </span>
        </div>

        {members.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            BELUM ADA ANGGOTA TERDAFTAR DI CLUSTER
          </div>
        ) : (
          <div className="space-y-1.5">
            {members.map((member, idx) => {
              const isPaid = paidMembers.includes(member);
              return (
                <div
                  key={idx}
                  className="bg-[#0E0F11] border border-[#26282B] p-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-600">[{idx + 1}]</span>
                    <span className="text-white font-sans font-medium">{member}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Payment Button */}
                    <button
                      onClick={() => handleTogglePayment(member)}
                      className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                        isPaid
                          ? "bg-zinc-900 border-[#00E676] text-[#00E676] font-bold"
                          : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                      }`}
                      title="Klik untuk mengubah status pembayaran"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPaid ? "bg-[#00E676] shadow-[0_0_4px_#00E676]" : "bg-[#FF4F00]"
                        }`}
                      />
                      <span>{isPaid ? "LUNAS" : "BELUM"}</span>
                    </button>

                    {/* Individual WA Link */}
                    <a
                      href={getWaLink(member)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-[#00E676] hover:text-black border border-zinc-700 text-[9px] uppercase tracking-wider text-zinc-300 flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-2.5 h-2.5" /> [ WA ]
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Member Inline Form */}
        <form onSubmit={handleAddMember} className="flex gap-1.5 pt-1">
          <input
            type="text"
            placeholder="TAMBAH NAMA ANGGOTA BARU..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="flex-1 bg-[#0E0F11] border border-[#26282B] px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] uppercase text-[10px]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-zinc-800 hover:bg-[#FF4F00] hover:text-black border border-zinc-700 text-[10px] text-zinc-200 font-bold uppercase transition-colors shrink-0"
          >
            <Plus className="w-3 h-3 inline mr-0.5" /> [ ADD ]
          </button>
        </form>
      </div>

      {/* Multi-Template WhatsApp Broadcast Hub */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span className="flex items-center gap-1 text-white font-bold">
            <MessageSquare className="w-3.5 h-3.5 text-[#FF4F00]" /> BROADCAST TEMPLATE DISPATCHER
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setMessageMode("routine")}
            className={`py-1 px-1.5 text-[8px] uppercase tracking-wider border transition-all ${
              messageMode === "routine"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#0E0F11] border-[#26282B] text-zinc-400 hover:border-zinc-500"
            }`}
          >
            PENGINGAT RUTIN
          </button>
          <button
            onClick={() => setMessageMode("urgent")}
            className={`py-1 px-1.5 text-[8px] uppercase tracking-wider border transition-all ${
              messageMode === "urgent"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#0E0F11] border-[#26282B] text-zinc-400 hover:border-zinc-500"
            }`}
          >
            JATUH TEMPO
          </button>
          <button
            onClick={() => setMessageMode("receipt")}
            className={`py-1 px-1.5 text-[8px] uppercase tracking-wider border transition-all ${
              messageMode === "receipt"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#0E0F11] border-[#26282B] text-zinc-400 hover:border-zinc-500"
            }`}
          >
            BUKTI LUNAS
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="lcd-screen p-2.5 text-[10px] text-zinc-300 font-sans leading-relaxed border border-zinc-800 select-all">
          {generateWaMessage()}
        </div>

        {/* Primary Broadcast CTA */}
        <a
          href={getWaLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 px-4 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold text-xs uppercase tracking-widest text-center transition-all active:scale-[0.99] shadow-[0_0_10px_rgba(255,79,0,0.3)]"
        >
          [ BROADCAST KE WHATSAPP SEKARANG ]
        </a>
      </div>
    </div>
  );
}

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
  ShieldAlert,
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
  const [confirmPurge, setConfirmPurge] = useState(false);

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
      <div className="p-8 text-center font-mono text-xs text-zinc-400 space-y-2">
        <div className="animate-pulse">INITIALIZING_GROUP_INSPECTOR...</div>
        <div className="text-[10px] text-zinc-400">INSPECTING_NODE</div>
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
    return `${greeting} Pengingat patungan langganan *${group.service_name}* (*${group.group_name}*) untuk bulan ini sebesar *${tariff}* (Jatuh tempo tgl ${group.billing_day}). Mohon transfer ke *${group.leader_name}* (${group.leader_phone}). Makasih!`;
  };

  const getWaLink = (targetName = "") => {
    const msg = generateWaMessage(targetName);
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Return & Purge Control Bar */}
      <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
        <div className="flex items-center gap-2">
          <Link
            to="/groups"
            className="px-2.5 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 lg:hover:text-white lg:hover:border-[#FF4F00] active:bg-[#1A1C20] flex items-center gap-1.5 text-[10px] uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> [ &lt; RETURN_TO_RACK ]
          </Link>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider hidden sm:inline">
            CLUSTER_NODE // {group.id.slice(0, 8)}
          </span>
        </div>

        {confirmPurge ? (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#FF4F00] font-bold">TERMINASI RACK?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-0.5 bg-rose-900 border border-rose-600 text-white text-[9px] uppercase font-bold"
            >
              {deleting ? "PURGING..." : "[ YA, HAPUS ]"}
            </button>
            <button
              onClick={() => setConfirmPurge(false)}
              className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] uppercase"
            >
              [ BATAL ]
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmPurge(true)}
            className="p-1.5 bg-[#111214] border border-rose-900/60 text-rose-400 lg:hover:bg-rose-950/40 text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
            title="Terminate Cluster"
          >
            <Trash2 className="w-3.5 h-3.5" /> [ PURGE_RACK ]
          </button>
        )}
      </div>

      {/* Main Workspace (Grid 12: 5 cols left, 7 cols right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Cluster Spec Sheet & Broadcast Station */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Cluster Spec Card */}
          <div className="border border-[#26282B] bg-[#111214] p-4 space-y-3 relative bracket-frame">
            <div className="absolute top-1 left-2 text-[8px] text-zinc-600">+</div>
            <div className="absolute top-1 right-2 text-[8px] text-zinc-600">+</div>

            <div className="flex justify-between items-start border-b border-dashed border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] text-[#DFFF00] font-bold uppercase tracking-wider">
                  CLUSTER_NODE // {group.service_name}
                </span>
                <h1 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                  {group.group_name}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-400 block uppercase">TARIF / KEPALA</span>
                <span className="text-sm sm:text-base font-bold text-[#00E676] tabular-nums">
                  {formatRupiah(group.price_per_person)}
                </span>
                <span className="text-[9px] text-zinc-400 block">/ BULAN</span>
              </div>
            </div>

            {/* Telemetry specs grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <User className="w-3.5 h-3.5 text-[#FF4F00]" />
                  <span className="text-zinc-400">PJ:</span>
                  <strong className="text-white">{group.leader_name}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="text-zinc-400">WA:</span>
                  <span className="text-zinc-300">{group.leader_phone}</span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="flex items-center justify-end gap-1 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-[#DFFF00]" />
                  <span className="text-zinc-400">JATUH TEMPO:</span>
                  <strong className="text-[#DFFF00]">Tgl {group.billing_day}</strong>
                </div>
                <div className="text-[9px] text-zinc-400">
                  POOL: <span className="text-white tabular-nums font-bold">{formatRupiah(totalTarget)}</span>
                </div>
              </div>
            </div>

            {/* Financial Settlement Progress Meter */}
            <div className="pt-2.5 border-t border-dashed border-zinc-800 space-y-1.5">
              <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
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

          {/* Multi-Template WhatsApp Broadcast Hub */}
          <div className="border border-[#26282B] bg-[#111214] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF4F00]" /> BROADCAST TEMPLATE DISPATCHER
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setMessageMode("routine")}
                className={`py-1 px-1.5 text-[9px] uppercase tracking-wider border transition-all ${
                  messageMode === "routine"
                    ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                    : "bg-[#0E0F11] border-[#26282B] text-zinc-300 lg:hover:border-zinc-500"
                }`}
              >
                PENGINGAT RUTIN
              </button>
              <button
                onClick={() => setMessageMode("urgent")}
                className={`py-1 px-1.5 text-[9px] uppercase tracking-wider border transition-all ${
                  messageMode === "urgent"
                    ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                    : "bg-[#0E0F11] border-[#26282B] text-zinc-300 lg:hover:border-zinc-500"
                }`}
              >
                JATUH TEMPO
              </button>
              <button
                onClick={() => setMessageMode("receipt")}
                className={`py-1 px-1.5 text-[9px] uppercase tracking-wider border transition-all ${
                  messageMode === "receipt"
                    ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                    : "bg-[#0E0F11] border-[#26282B] text-zinc-300 lg:hover:border-zinc-500"
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
              className="block w-full py-2.5 px-4 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-xs uppercase tracking-widest text-center transition-colors active:scale-[0.99]"
            >
              [ BROADCAST KE WHATSAPP SEKARANG ]
            </a>
          </div>
        </div>

        {/* Right Column: Member Roster & Individual Checklist Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#26282B] bg-[#111214] p-3.5 sm:p-4 space-y-3 bracket-frame">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Radio className="w-4 h-4 text-[#00E676]" /> CHECKLIST ANGGOTA & STATUS BAYAR
              </span>
              <span className="text-[#DFFF00] font-bold tabular-nums">
                {paidCount} / {members.length} ANGGOTA LUNAS
              </span>
            </div>

            {members.length === 0 ? (
              <div className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                BELUM ADA ANGGOTA TERDAFTAR DI CLUSTER
              </div>
            ) : (
              <div className="space-y-1.5">
                {members.map((member, idx) => {
                  const isPaid = paidMembers.includes(member);
                  return (
                    <div
                      key={idx}
                      className="bg-[#0E0F11] border border-[#26282B] p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[9px] font-mono text-zinc-400">[{idx + 1}]</span>
                        <span className="text-white font-sans font-medium">{member}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Payment Button */}
                        <button
                          onClick={() => handleTogglePayment(member)}
                          className={`px-2.5 py-1 border text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-[0.98] ${
                            isPaid
                              ? "bg-zinc-900 border-[#00E676] text-[#00E676] font-bold"
                              : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                          }`}
                          title="Klik untuk mengubah status pembayaran"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? "bg-[#00E676] ring-1 ring-[#00E676]/50" : "bg-[#FF4F00]"
                            }`}
                          />
                          <span>{isPaid ? "LUNAS" : "BELUM"}</span>
                        </button>

                        {/* Individual WA Link */}
                        <a
                          href={getWaLink(member)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-zinc-900 lg:hover:bg-[#00E676] lg:hover:text-black border border-zinc-700 text-[9px] uppercase tracking-wider text-zinc-300 flex items-center gap-1 transition-colors active:bg-[#1A1C20]"
                        >
                          <Send className="w-2.5 h-2.5" /> [ DISPATCH_WA ]
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Member Inline Form */}
            <form onSubmit={handleAddMember} className="flex gap-2 pt-2 border-t border-dashed border-zinc-800">
              <input
                type="text"
                placeholder="TAMBAH NAMA ANGGOTA BARU KE CLUSTER..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] uppercase text-[10px]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 lg:hover:bg-[#FF4F00] lg:hover:text-black border border-zinc-700 text-[10px] text-zinc-200 font-bold uppercase transition-colors shrink-0 active:scale-[0.98]"
              >
                <Plus className="w-3 h-3 inline mr-1" /> [ ADD_MEMBER ]
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

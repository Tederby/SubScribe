import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Phone,
  User,
  Send,
  Radio,
  Plus,
  MessageSquare,
  Edit3,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  UserMinus,
  Sliders,
} from "lucide-react";
import {
  dataService,
  sanitizeIndonesianPhone,
  validateIndonesianPhone,
} from "../services/dataService";

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

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [messageMode, setMessageMode] = useState("routine"); // 'routine' | 'urgent' | 'receipt'
  const [confirmPurge, setConfirmPurge] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editLeaderName, setEditLeaderName] = useState("");
  const [editLeaderPhone, setEditLeaderPhone] = useState("");
  const [editPricePerPerson, setEditPricePerPerson] = useState("");
  const [editBillingDay, setEditBillingDay] = useState(1);
  const [editPhoneError, setEditPhoneError] = useState("");
  const [editConfirmStep, setEditConfirmStep] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Rollover / Cycle Reset Confirm
  const [confirmResetCycle, setConfirmResetCycle] = useState(false);

  // Delete Member Confirm
  const [memberToDelete, setMemberToDelete] = useState(null);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataService.getGroupById(id);
      setGroup(data);
    } catch (err) {
      console.error("Gagal memuat detail grup:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

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

  const handleConfirmRemoveMember = () => {
    if (!memberToDelete) return;
    const updated = dataService.removeMemberFromGroup(group.id, memberToDelete);
    if (updated) {
      setGroup(updated);
      setMemberToDelete(null);
    }
  };

  const handleResetBillingCycle = () => {
    const updated = dataService.resetBillingCycle(group.id);
    if (updated) {
      setGroup(updated);
      setConfirmResetCycle(false);
    }
  };

  // Open Edit Modal with prefilled values
  const openEditModal = () => {
    if (!group) return;
    setEditGroupName(group.group_name);
    setEditServiceName(group.service_name);
    setEditLeaderName(group.leader_name);
    setEditLeaderPhone(group.leader_phone);
    setEditPricePerPerson(group.price_per_person.toString());
    setEditBillingDay(group.billing_day);
    setEditPhoneError("");
    setEditConfirmStep(false);
    setShowEditModal(true);
  };

  const handleEditPhoneChange = (e) => {
    const raw = e.target.value;
    const sanitized = sanitizeIndonesianPhone(raw);
    setEditLeaderPhone(sanitized);
    if (sanitized && !validateIndonesianPhone(sanitized)) {
      setEditPhoneError("Nomor wajib format 628xxx (10-15 digit)");
    } else {
      setEditPhoneError("");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editConfirmStep) {
      if (editLeaderPhone.trim() && !validateIndonesianPhone(editLeaderPhone)) {
        alert("Nomor WhatsApp PJ tidak valid. Gunakan format 628xxx (10-15 digit) atau kosongkan.");
        return;
      }
      setEditConfirmStep(true);
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await dataService.updateGroup(group.id, {
        group_name: editGroupName.trim(),
        service_name: editServiceName.trim(),
        leader_name: editLeaderName.trim(),
        leader_phone: editLeaderPhone.trim(),
        price_per_person: Number(editPricePerPerson) || 0,
        billing_day: Number(editBillingDay) || 1,
      });
      if (updated) {
        setGroup(updated);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui konfigurasi cluster.");
    } finally {
      setSavingEdit(false);
      setEditConfirmStep(false);
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
        <div className="text-[10px] text-zinc-500">INSPECTING_NODE</div>
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
  const dueInfo = calculateDueDays(group.billing_day);

  const generateWaMessage = (targetName = "") => {
    const greeting = targetName ? `Halo ${targetName}!` : "Halo teman-teman!";
    const tariff = formatRupiah(group.price_per_person);
    const leaderContact = group.leader_phone ? ` (${group.leader_phone})` : "";

    if (messageMode === "urgent") {
      return `${greeting} PEMBERITAHUAN: Hari ini jatuh tempo pembayaran patungan *${group.service_name}* (*${group.group_name}*) sebesar *${tariff}*. Tolong segera transfer ke *${group.leader_name}*${leaderContact} agar akun bersama tidak terputus. Terima kasih!`;
    }
    if (messageMode === "receipt") {
      return `${greeting} KONFIRMASI: Pembayaran patungan *${group.service_name}* sebesar *${tariff}* telah diterima lunas oleh *${group.leader_name}*. Akun aktif untuk periode ini. Terima kasih atas kerjasamanya!`;
    }
    return `${greeting} Pengingat patungan langganan *${group.service_name}* (*${group.group_name}*) untuk bulan ini sebesar *${tariff}* (Jatuh tempo tgl ${group.billing_day}). Mohon transfer ke *${group.leader_name}*${leaderContact}. Makasih!`;
  };

  const getWaLink = (targetName = "") => {
    const msg = generateWaMessage(targetName);
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Return & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26282B] pb-2 text-xs">
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

        <div className="flex items-center gap-1.5">
          {/* Edit Cluster Button */}
          <button
            onClick={openEditModal}
            className="px-2.5 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 lg:hover:text-white lg:hover:border-[#DFFF00] text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors active:bg-[#1A1C20]"
          >
            <Edit3 className="w-3 h-3 text-[#DFFF00]" /> [ EDIT_CONFIG ]
          </button>

          {/* Purge / Delete Group */}
          {confirmPurge ? (
            <div className="flex items-center gap-1.5 bg-rose-950/60 p-1 border border-rose-600">
              <span className="text-[9px] text-[#FF4F00] font-bold">TERMINASI?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2 py-0.5 bg-rose-900 border border-rose-600 text-white text-[9px] uppercase font-bold"
              >
                {deleting ? "PURGING..." : "[ YA ]"}
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
              <Trash2 className="w-3.5 h-3.5" /> [ PURGE ]
            </button>
          )}
        </div>
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
                  <span className="text-zinc-300 tabular-nums">
                    {group.leader_phone || "[TIDAK TERCATAT]"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="flex items-center justify-end gap-1 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-[#DFFF00]" />
                  <span className="text-zinc-400">JATUH TEMPO:</span>
                  <strong className={dueInfo.isUrgent ? "text-[#FF4F00]" : "text-[#DFFF00]"}>
                    Tgl {group.billing_day} ({dueInfo.label})
                  </strong>
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

            {/* Rollover / Reset Month Cycle Action */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              {confirmResetCycle ? (
                <div className="w-full flex items-center justify-between bg-zinc-900 p-1.5 border border-[#DFFF00]">
                  <span className="text-[9px] text-[#DFFF00]">RESET STATUS LUNAS SIKLUS BARU?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={handleResetBillingCycle}
                      className="px-2 py-0.5 bg-[#DFFF00] text-black font-bold text-[9px] uppercase"
                    >
                      [ YA, RESET ]
                    </button>
                    <button
                      onClick={() => setConfirmResetCycle(false)}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] uppercase"
                    >
                      [ BATAL ]
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmResetCycle(true)}
                  className="w-full py-1.5 bg-[#0E0F11] lg:hover:bg-zinc-900 border border-zinc-800 text-zinc-400 lg:hover:text-[#DFFF00] text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-[#DFFF00]" /> [ RESET_SIKLUS_BULAN_BARU ]
                </button>
              )}
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

            {/* Member Delete Confirmation Banner */}
            {memberToDelete && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600 text-xs flex items-center justify-between gap-2">
                <span className="text-rose-200 text-[10px]">
                  Hapus <strong>{memberToDelete}</strong> dari roster cluster?
                </span>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={handleConfirmRemoveMember}
                    className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] uppercase"
                  >
                    [ YA, HAPUS ]
                  </button>
                  <button
                    onClick={() => setMemberToDelete(null)}
                    className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] uppercase"
                  >
                    [ BATAL ]
                  </button>
                </div>
              </div>
            )}

            {members.length === 0 ? (
              <div className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                BELUM ADA ANGGOTA TERDAFTAR DI CLUSTER
              </div>
            ) : (
              <div className="space-y-1.5">
                {members.map((member, idx) => {
                  const isPaid = paidMembers.includes(member);
                  const isLeader = member === group.leader_name;

                  return (
                    <div
                      key={idx}
                      className="bg-[#0E0F11] border border-[#26282B] p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">[{idx + 1}]</span>
                        <span className="text-white font-sans font-medium truncate">{member}</span>
                        {isLeader && (
                          <span className="px-1.5 py-0.2 bg-[#FF4F00]/20 border border-[#FF4F00] text-[#FF4F00] text-[8px] font-bold uppercase shrink-0">
                            PJ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
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
                          title="Kirim pesan personal via WhatsApp"
                        >
                          <Send className="w-2.5 h-2.5" /> [ WA ]
                        </a>

                        {/* Remove Member Button */}
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 border border-transparent hover:border-rose-900 transition-colors"
                          title="Hapus anggota dari cluster"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
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
                className="flex-1 bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] uppercase text-[10px]"
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

      {/* Edit Cluster Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111214] border-2 border-[#26282B] w-full max-w-lg p-4 sm:p-5 space-y-3.5 max-h-[92vh] overflow-y-auto bracket-frame">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
              <span className="text-[#DFFF00] font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> [ RECALIBRATE_CLUSTER_CONFIG ]
              </span>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  NAMA CLUSTER PATUNGAN *
                </label>
                <input
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
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
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    NAMA PENANGGUNG JAWAB (PJ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLeaderName}
                    onChange={(e) => setEditLeaderName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    NO. WHATSAPP PJ (OPSIONAL, 628xxx)
                  </label>
                  <input
                    type="text"
                    placeholder="6281234567890 (Opsional)"
                    value={editLeaderPhone}
                    onChange={handleEditPhoneChange}
                    className={`w-full bg-[#0E0F11] border px-3 py-1.5 text-white focus:outline-none ${
                      editPhoneError ? "border-rose-500" : "border-[#26282B] focus:border-[#FF4F00]"
                    }`}
                  />
                  {editPhoneError && (
                    <span className="text-[9px] text-rose-400 block mt-0.5">{editPhoneError}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TARIF PER KEPALA (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPricePerPerson}
                    onChange={(e) => setEditPricePerPerson(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    TGL JATUH TEMPO (1-31) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editBillingDay}
                    onChange={(e) => setEditBillingDay(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              {editConfirmStep ? (
                <div className="p-3 bg-amber-950/40 border border-[#DFFF00] space-y-2">
                  <div className="text-[10px] text-[#DFFF00] flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> KONFIRMASI PEMBARUAN RACK
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-relaxed">
                    Perubahan tarif atau jatuh tempo akan langsung diterapkan pada seluruh checklist dan broadcast WhatsApp cluster ini.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 py-2 bg-[#DFFF00] text-black font-bold uppercase text-[10px]"
                    >
                      {savingEdit ? "COMMITTING..." : "[ YA, TERAPKAN PERUBAHAN ]"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditConfirmStep(false)}
                      className="px-3 py-2 bg-zinc-800 text-zinc-300 uppercase text-[10px]"
                    >
                      [ KEMBALI ]
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#DFFF00] hover:bg-[#cbe600] text-black font-bold uppercase tracking-wider text-xs transition-colors mt-2"
                >
                  [ REVIEW & COMMIT CHANGES ]
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

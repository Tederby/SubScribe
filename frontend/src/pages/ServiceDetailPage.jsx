import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Sliders, ChevronRight, Copy, Check, Sparkles, Shield, Tag } from "lucide-react";
import { dataService } from "../services/dataService";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState(4);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        const data = await dataService.getServiceById(id);
        setService(data);
        if (data && data.max_slots) {
          setSelectedSlots(Math.max(2, data.max_slots));
        }
      } catch (err) {
        console.error("Gagal membaca detail layanan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500 space-y-2">
        <div className="animate-pulse">READING_SERVICE_TELEMETRY...</div>
        <div className="text-[10px] text-zinc-600">SPEC_PARSER: ACTIVE</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 text-center space-y-3 font-mono">
        <p className="text-xs text-[#FF4F00] font-bold">ERROR: SERVICE_RECORD_NOT_FOUND</p>
        <Link
          to="/services"
          className="inline-block px-3 py-1.5 bg-[#111214] border border-[#26282B] text-xs text-zinc-400 hover:text-white"
        >
          [ &lt; RETURN_TO_CATALOG ]
        </Link>
      </div>
    );
  }

  const maxSlots = Math.max(2, service.max_slots || 1);
  const basePrice = Number(service.monthly_price) || 0;
  const currentPerPerson = Math.round(basePrice / selectedSlots);
  const currentSavings = basePrice - currentPerPerson;
  const savingsPercent = Math.round((currentSavings / basePrice) * 100);

  // Generate matrix
  const splitOptions = [];
  for (let s = 2; s <= maxSlots; s++) {
    splitOptions.push({
      slots: s,
      perPerson: Math.round(basePrice / s),
    });
  }

  const handleCopyInvitation = () => {
    const text = `Halo! Mau patungan langganan *${service.name}* bareng? Cuma *${formatRupiah(currentPerPerson)}* per orang/bulan (dibagi ${selectedSlots} slot profil). Hemat ${savingsPercent}% dibanding bayar sendiri! Yang mau gabung balas yaa.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Return Bar */}
      <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
        <Link
          to="/services"
          className="px-2.5 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 lg:hover:text-white lg:hover:border-[#FF4F00] active:bg-[#1A1C20] flex items-center gap-1.5 text-[10px] uppercase transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> [ &lt; RETURN_TO_CATALOG ]
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider hidden sm:inline">
            SPECIFICATION_PARSER
          </span>
          <span className="text-[10px] text-[#FF4F00] font-bold">
            SKU // {service.sku}
          </span>
        </div>
      </div>

      {/* Main Workspace (Grid 12: 5 cols left, 7 cols right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Spec Sheet Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#26282B] bg-[#111214] p-4 space-y-3 relative bracket-frame">
            <div className="absolute top-1 left-2 text-[8px] text-zinc-600">+</div>
            <div className="absolute top-1 right-2 text-[8px] text-zinc-600">+</div>

            <div className="flex justify-between items-start border-b border-dashed border-zinc-800 pb-3">
              <div>
                <div className="text-[9px] text-[#DFFF00] uppercase tracking-wider font-bold">
                  {service.categories?.name || "CAT.GENERAL"}
                </div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 font-sans">
                  {service.name}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-zinc-500 block uppercase">HARGA_RESMI</span>
                <span className="text-sm sm:text-base font-bold text-[#00E676] tabular-nums">
                  {formatRupiah(service.monthly_price)}
                </span>
                <span className="text-[8px] text-zinc-500 block">/ BULAN</span>
              </div>
            </div>

            <div className="text-xs text-zinc-300 font-sans leading-relaxed">
              {service.description || "TIDAK ADA DESKRIPSI TELEMETRI TAMBAHAN."}
            </div>

            <div className="pt-2 border-t border-[#26282B] space-y-1.5 text-[10px] text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Cpu className="w-3.5 h-3.5 text-[#FF4F00]" /> KAPASITAS_SLOT:
                </span>
                <span className="font-bold text-white">{service.max_slots} PROFIL SIMULTAN</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Tag className="w-3.5 h-3.5 text-[#DFFF00]" /> ESTIMASI_TAHUNAN:
                </span>
                <span className="text-zinc-200 tabular-nums">
                  {formatRupiah(service.monthly_price * 12)} / TAHUN
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Shield className="w-3.5 h-3.5 text-[#00E676]" /> KONTRAK_BILLING:
                </span>
                <span className="text-[#00E676] font-bold">REKUREN BULANAN</span>
              </div>
            </div>
          </div>

          {/* Additional Desktop Hardware Note */}
          <div className="hidden lg:block border border-[#26282B] bg-[#0E0F11] p-3 text-[10px] text-zinc-500 space-y-1">
            <div className="text-[#DFFF00] font-bold text-[9px] uppercase">// CATATAN_PATUNGAN</div>
            <p>
              Dengan membagi biaya langganan resmi bersama anggota terpercaya, setiap anggota mendapatkan akun legal mandiri tanpa melanggar ketentuan fair usage.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Synthesizer Split Station */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#26282B] bg-[#111214] p-3.5 sm:p-4 space-y-3.5 bracket-frame">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Sliders className="w-4 h-4 text-[#FF4F00]" /> KALKULATOR APPARATUS PATUNGAN
              </span>
              <span className="text-[#DFFF00] font-bold">
                {selectedSlots} / {maxSlots} SLOTS TERPILIH
              </span>
            </div>

            {/* Dynamic Recessed LCD Display */}
            <div className="lcd-screen p-3.5 sm:p-4 rounded-none space-y-2.5 border border-zinc-800">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                    TARIF PER KEPALA / BULAN
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#DFFF00] tabular-nums font-mono mt-0.5">
                    {formatRupiah(currentPerPerson)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] text-[#00E676] uppercase tracking-wider font-bold flex items-center justify-end gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> HEMAT {savingsPercent}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 tabular-nums mt-0.5">
                    Hemat {formatRupiah(currentSavings)}/bulan
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-dashed border-zinc-800/80 flex flex-col sm:flex-row justify-between text-[9px] sm:text-[10px] text-zinc-400 gap-1">
                <span>TOTAL SIRKULASI POOL ({selectedSlots} ANGGOTA):</span>
                <span className="text-zinc-200 tabular-nums font-bold">
                  {formatRupiah(currentPerPerson * selectedSlots * 12)} / TAHUN
                </span>
              </div>
            </div>

            {/* Partition Matrix Buttons */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                PILIH JUMLAH ANGGOTA PARTISI:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {splitOptions.map((opt) => (
                  <button
                    key={opt.slots}
                    onClick={() => setSelectedSlots(opt.slots)}
                    className={`p-2.5 border text-left transition-all active:scale-[0.98] ${
                      selectedSlots === opt.slots
                        ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold shadow-[0_0_8px_rgba(255,79,0,0.3)]"
                        : "bg-[#0E0F11] border-[#26282B] text-zinc-300 lg:hover:border-zinc-500"
                    }`}
                  >
                    <div className="text-[8px] uppercase tracking-wider">
                      {opt.slots} ORANG
                    </div>
                    <div className="text-xs font-bold tabular-nums mt-0.5">
                      {formatRupiah(opt.perPerson)}
                    </div>
                    <div className="text-[8px] text-zinc-500">/bln</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Shareable Spec Invitation */}
            <button
              onClick={handleCopyInvitation}
              className="w-full py-2.5 bg-[#0E0F11] lg:hover:bg-zinc-900 border border-[#26282B] text-zinc-300 lg:hover:text-white text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:bg-[#1A1C20]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="text-[#00E676] font-bold">[ PESAN AJAKAN TERSALIN KE CLIPBOARD ]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FF4F00]" />
                  <span>[ SALIN FORMAT AJAKAN WHATSAPP // TEMPLATE ]</span>
                </>
              )}
            </button>

            {/* Hardware Action Button */}
            <button
              onClick={() =>
                navigate("/groups", {
                  state: {
                    prefillServiceName: service.name,
                    prefillPrice: currentPerPerson,
                    prefillSlots: selectedSlots,
                  },
                })
              }
              className="w-full py-3.5 px-4 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-[0_0_12px_rgba(255,79,0,0.3)]"
            >
              <span>[ INITIALIZE_SPLIT_GROUP // DIAL TO RACK ]</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

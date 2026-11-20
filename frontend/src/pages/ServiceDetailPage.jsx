import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Sliders,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Shield,
  Tag,
  Users,
  Minus,
  Plus,
  Info,
} from "lucide-react";
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
          setSelectedSlots(Math.max(1, data.max_slots));
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
      <div className="p-8 text-center font-mono text-xs text-zinc-400 space-y-2">
        <div className="animate-pulse">READING_SERVICE_TELEMETRY...</div>
        <div className="text-[10px] text-zinc-400">SPEC_PARSER: ACTIVE</div>
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

  const maxSlots = Math.max(1, service.max_slots || 1);
  const basePrice = Number(service.monthly_price) || 0;
  const currentPerPerson = Math.round(basePrice / selectedSlots);
  const currentSavings = basePrice - currentPerPerson;
  const savingsPercent = basePrice > 0 ? Math.round((currentSavings / basePrice) * 100) : 0;
  const totalCirculationYearly = currentPerPerson * selectedSlots * 12;

  // Generate matrix options from 1 (Solo) up to at least maxSlots or 6
  const upperLimit = Math.max(maxSlots, 6);
  const splitOptions = [];
  for (let s = 1; s <= upperLimit; s++) {
    splitOptions.push({
      slots: s,
      perPerson: Math.round(basePrice / s),
      isOfficialMax: s === maxSlots,
    });
  }

  const handleCopyInvitation = () => {
    const text = selectedSlots === 1
      ? `Halo! Langganan *${service.name}* tarif resminya *${formatRupiah(basePrice)}* per bulan.`
      : `Halo! Mau patungan langganan *${service.name}* bareng? Cuma *${formatRupiah(currentPerPerson)}* per orang/bulan (dibagi ${selectedSlots} slot profil). Hemat ${savingsPercent}% dibanding bayar sendiri (*${formatRupiah(basePrice)}*)! Yang mau gabung balas yaa.`;
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
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider hidden sm:inline">
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
                <span className="text-[9px] text-zinc-400 block uppercase">BIAYA RESMI</span>
                <span className="text-sm sm:text-base font-bold text-[#00E676] tabular-nums">
                  {formatRupiah(service.monthly_price)}
                </span>
                <span className="text-[9px] text-zinc-400 block">/ BULAN TOTAL</span>
              </div>
            </div>

            <div className="text-xs text-zinc-300 font-sans leading-relaxed">
              {service.description || "Layanan digital resmi untuk kebutuhan multimedia atau produktivitas bersama."}
            </div>

            <div className="pt-2 border-t border-[#26282B] space-y-1.5 text-[10px] text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-[#FF4F00]" /> KAPASITAS RESMI:
                </span>
                <span className="font-bold text-white">{service.max_slots} SLOT ANGGOTA</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Tag className="w-3.5 h-3.5 text-[#DFFF00]" /> ESTIMASI TAHUNAN RESMI:
                </span>
                <span className="text-zinc-200 tabular-nums">
                  {formatRupiah(service.monthly_price * 12)} / TAHUN
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Shield className="w-3.5 h-3.5 text-[#00E676]" /> KONTRAK BILLING:
                </span>
                <span className="text-[#00E676] font-bold">REKUREN BULANAN</span>
              </div>
            </div>
          </div>

          {/* Telemetry Hardware Note */}
          <div className="border border-[#26282B] bg-[#0E0F11] p-3 text-[10px] text-zinc-400 space-y-1.5">
            <div className="text-[#DFFF00] font-bold text-[9px] uppercase flex items-center gap-1">
              <Info className="w-3 h-3" /> // FAIR_USAGE_POLICY_TELEMETRY
            </div>
            <p className="leading-relaxed">
              Biaya patungan dihitung dari total biaya bulanan dibagi jumlah anggota cluster yang aktif. Tarif resmi dapat dibagikan hingga batas wajar perangkat simultan.
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
                {selectedSlots} ANGGOTA TERPILIH
              </span>
            </div>

            {/* Stepper Fine-tuning */}
            <div className="flex items-center justify-between bg-[#0E0F11] border border-[#26282B] p-2.5">
              <span className="text-[10px] text-zinc-300 uppercase flex items-center gap-1.5 font-bold">
                <Users className="w-3.5 h-3.5 text-[#FF4F00]" /> ATUR JUMLAH PARTISI ANGGOTA:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSlots((prev) => Math.max(1, prev - 1))}
                  disabled={selectedSlots <= 1}
                  className="w-7 h-7 bg-zinc-900 border border-zinc-700 text-white disabled:opacity-30 flex items-center justify-center hover:border-[#FF4F00] active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#DFFF00] tabular-nums">
                  {selectedSlots}
                </span>
                <button
                  onClick={() => setSelectedSlots((prev) => Math.min(16, prev + 1))}
                  disabled={selectedSlots >= 16}
                  className="w-7 h-7 bg-zinc-900 border border-zinc-700 text-white disabled:opacity-30 flex items-center justify-center hover:border-[#FF4F00] active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Dynamic Recessed LCD Display */}
            <div className="lcd-screen p-3.5 sm:p-4 rounded-none space-y-2.5 border border-zinc-800">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                    TARIF PER KEPALA / BULAN
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#DFFF00] tabular-nums font-mono mt-0.5">
                    {formatRupiah(currentPerPerson)}
                  </div>
                </div>
                <div className="text-right">
                  {selectedSlots > 1 ? (
                    <>
                      <div className="text-[9px] sm:text-[10px] text-[#00E676] uppercase tracking-wider font-bold flex items-center justify-end gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> HEMAT {savingsPercent}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-zinc-400 tabular-nums mt-0.5">
                        Hemat {formatRupiah(currentSavings)}/bln/orang
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-zinc-400 uppercase">
                      HARGA MANDIRI (SOLO)
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-dashed border-zinc-800/80 flex flex-col sm:flex-row justify-between text-[9px] sm:text-[10px] text-zinc-400 gap-1">
                <span>TOTAL SIRKULASI CLUSTER ({selectedSlots} ANGGOTA):</span>
                <span className="text-zinc-200 tabular-nums font-bold">
                  {formatRupiah(totalCirculationYearly)} / TAHUN
                </span>
              </div>
            </div>

            {/* Partition Matrix Buttons */}
            <div className="space-y-1.5">
              <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                <span>OPSI PEMBAGIAN CEPAT:</span>
                <span className="text-zinc-500 text-[9px]">*Batas resmi: {service.max_slots} Slot</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {splitOptions.map((opt) => (
                  <button
                    key={opt.slots}
                    onClick={() => setSelectedSlots(opt.slots)}
                    className={`p-2 border text-left active:scale-[0.98] transition-colors ${
                      selectedSlots === opt.slots
                        ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                        : "bg-[#0E0F11] border-[#26282B] text-zinc-300 lg:hover:border-zinc-500"
                    }`}
                  >
                    <div className="text-[9px] uppercase tracking-wider flex justify-between items-center">
                      <span>{opt.slots === 1 ? "1 (SOLO)" : `${opt.slots} ORANG`}</span>
                      {opt.isOfficialMax && (
                        <span className="text-[8px] bg-zinc-800 text-zinc-300 px-1 py-0.2">
                          RESMI
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold tabular-nums mt-0.5">
                      {formatRupiah(opt.perPerson)}
                    </div>
                    <div className={`text-[8px] ${selectedSlots === opt.slots ? "text-black/80" : "text-zinc-500"}`}>
                      {opt.slots === 1 ? "Biaya penuh" : `Hemat ${Math.round(((basePrice - opt.perPerson) / basePrice) * 100)}%`}
                    </div>
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
                  <span className="text-[#00E676] font-bold">[ FORMAT AJAKAN TERSALIN KE CLIPBOARD ]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FF4F00]" />
                  <span>[ SALIN FORMAT AJAKAN WHATSAPP ]</span>
                </>
              )}
            </button>

            {/* Hardware Action Button -> Dial into Cluster Rack */}
            <button
              onClick={() =>
                navigate("/groups", {
                  state: {
                    prefillServiceName: service.name,
                    prefillTotalMonthlyPrice: service.monthly_price,
                    prefillSlots: selectedSlots,
                    prefillPricePerPerson: currentPerPerson,
                  },
                })
              }
              className="w-full py-3.5 px-4 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors active:scale-[0.99] shadow-lg"
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

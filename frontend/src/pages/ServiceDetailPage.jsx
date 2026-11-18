import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Sliders, ChevronRight } from "lucide-react";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/services/${id}`);
        const result = await res.json();
        if (result.success) setService(result.data);
      } catch (err) {
        console.error("Gagal memuat detail layanan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, API_URL]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500">
        READING_SERVICE_TELEMETRY...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 text-center space-y-3 font-mono">
        <p className="text-xs text-[#FF4F00]">ERROR: SERVICE_RECORD_NOT_FOUND</p>
        <Link to="/services" className="text-xs text-zinc-400 hover:text-white underline">
          &lt; RETURN_TO_CATALOG
        </Link>
      </div>
    );
  }

  const maxSlots = Math.max(2, service.max_slots || 1);
  const splitOptions = [];
  for (let slots = 2; slots <= maxSlots; slots++) {
    splitOptions.push({
      slots,
      perPerson: Math.round(Number(service.monthly_price) / slots)
    });
  }

  return (
    <div className="p-4 space-y-4 font-mono">
      {/* Return Bar */}
      <div className="flex items-center gap-2 text-xs border-b border-[#26282B] pb-2">
        <Link
          to="/services"
          className="px-2 py-1 bg-[#111214] border border-[#26282B] text-zinc-300 hover:text-white hover:border-[#FF4F00] flex items-center gap-1 text-[11px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> [ ESC ]
        </Link>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          SPEC // {service.sku}
        </span>
      </div>

      {/* Spec Sheet Main Panel */}
      <div className="border border-[#26282B] bg-[#111214] p-4 space-y-3 relative">
        <div className="absolute top-1 left-2 text-[8px] text-zinc-600">+</div>
        <div className="absolute top-1 right-2 text-[8px] text-zinc-600">+</div>

        <div className="flex justify-between items-start border-b border-dashed border-zinc-800 pb-3">
          <div>
            <div className="text-[9px] text-[#DFFF00] uppercase tracking-wider font-bold">
              {service.categories?.name || "CAT.GENERAL"}
            </div>
            <h1 className="text-base font-bold text-white tracking-tight mt-0.5 font-sans">
              {service.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 block">BASE_PRICE</span>
            <span className="text-sm font-bold text-[#00E676] tabular-nums">
              {formatRupiah(service.monthly_price)}
            </span>
          </div>
        </div>

        <div className="text-xs text-zinc-300 font-sans leading-relaxed pt-1">
          {service.description || "NO_DESCRIPTION_TELEMETRY"}
        </div>

        <div className="pt-2 border-t border-[#26282B] flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#FF4F00]" /> MAX_CAPACITY:
          </span>
          <span className="font-bold text-white">{service.max_slots} PROFILES</span>
        </div>
      </div>

      {/* Interactive Split Calculation Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1 text-white font-bold">
            <Sliders className="w-3.5 h-3.5 text-[#FF4F00]" /> SPLIT_BILL_MATRIX
          </span>
          <span className="text-zinc-500">2..{maxSlots} PARTITIONS</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {splitOptions.map((opt) => (
            <div
              key={opt.slots}
              className="bg-[#111214] border border-[#26282B] p-2.5 flex flex-col justify-between hover:border-zinc-500 transition-colors"
            >
              <div className="text-[9px] text-zinc-400 uppercase tracking-wider">
                DIVIDE_{opt.slots}_SLOTS
              </div>
              <div className="text-xs font-bold text-[#DFFF00] tabular-nums mt-1">
                {formatRupiah(opt.perPerson)}
              </div>
              <div className="text-[8px] text-zinc-500 mt-0.5">/ MEMBER / MO</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Action Button */}
      <button
        onClick={() => navigate("/groups", { state: { prefillServiceName: service.name, prefillPrice: service.monthly_price } })}
        className="w-full py-3 px-4 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <span>[ INITIALIZE_SPLIT_GROUP ]</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

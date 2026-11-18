import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, ChevronRight, Activity } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/categories`)
        ]);
        const servicesData = await servicesRes.json();
        const categoriesData = await categoriesRes.json();

        if (servicesData.success) setServices(servicesData.data || []);
        if (categoriesData.success) setCategories(categoriesData.data || []);
      } catch (err) {
        console.error("Gagal memuat katalog layanan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_URL]);

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter((s) => s.category_id === selectedCategory);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 space-y-4">
      {/* Spec Header */}
      <div className="border border-[#26282B] bg-[#111214] p-3 rounded-none relative">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-2 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#FF4F00] font-bold">
            <Activity className="w-3.5 h-3.5" /> SEC.01 // CATALOG_TELEMETRY
          </span>
          <span>COUNT: {filteredServices.length}</span>
        </div>
        <h1 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF4F00]" /> Katalog Layanan Digital
        </h1>
        <p className="font-mono text-[10px] text-zinc-400 mt-1">
          Pilih unit layanan untuk membuka kalkulator patungan dan spesifikasi pembagian slot.
        </p>
      </div>

      {/* Category Filter Switches */}
      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">FILTER_BY_CATEGORY:</div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
              selectedCategory === "all"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#111214] text-zinc-400 border-[#26282B] hover:border-zinc-500"
            }`}
          >
            {selectedCategory === "all" ? "[ ALL ]" : "ALL"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                  : "bg-[#111214] text-zinc-400 border-[#26282B] hover:border-zinc-500"
              }`}
            >
              {selectedCategory === cat.id ? `[ ${cat.name} ]` : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards (Rack Units) */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-8 text-center font-mono text-xs text-zinc-500">
          SCANNING_CATALOG_REGISTRY...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-8 text-center font-mono text-xs text-zinc-500">
          NO_SERVICES_INDEXED
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="group block bg-[#111214] border border-[#26282B] hover:border-[#FF4F00] transition-colors p-3.5 relative"
            >
              {/* Corner crosshair marks */}
              <div className="absolute top-1 left-1.5 font-mono text-[8px] text-zinc-600">+</div>
              <div className="absolute top-1 right-1.5 font-mono text-[8px] text-zinc-600">+</div>

              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] px-1 py-0.2 bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {service.sku}
                    </span>
                    <span className="font-mono text-[9px] text-[#DFFF00]">
                      {service.categories?.name || "CAT.GENERAL"}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white group-hover:text-[#FF4F00] transition-colors">
                    {service.name}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#00E676] tabular-nums">
                    {formatRupiah(service.monthly_price)}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-400">/ BULAN</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-800 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                <span className="text-zinc-500">MAX_ALLOCATION: <strong className="text-zinc-300">{service.max_slots} SLOTS</strong></span>
                <span className="flex items-center text-[#FF4F00] font-bold group-hover:translate-x-1 transition-transform">
                  INSPECT <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

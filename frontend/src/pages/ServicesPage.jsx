import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layers, ChevronRight, Activity, Search, X, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { dataService } from "../services/dataService";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSource, setDataSource] = useState("init");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          dataService.getServices(),
          dataService.getCategories(),
        ]);
        setServices(servicesRes.data || []);
        setCategories(categoriesRes.data || []);
        setDataSource(servicesRes.source);
      } catch (err) {
        console.error("Gagal membaca registry layanan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category_id === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  // Telemetry metrics
  const lowestSplitPrice = useMemo(() => {
    if (services.length === 0) return 0;
    const splits = services.map((s) => Math.round(s.monthly_price / (s.max_slots || 1)));
    return Math.min(...splits);
  }, [services]);

  return (
    <div className="space-y-4 font-mono">
      {/* Spec Apparatus Header */}
      <div className="border border-[#26282B] bg-[#111214] p-3 sm:p-4 relative bracket-frame">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-2 text-[9px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#FF4F00] font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> SEC.01 // CATALOG_REGISTRY
          </span>
          <span className="text-zinc-400 tabular-nums">
            DATA_ORIGIN: {dataSource.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4F00]" /> Katalog Layanan Digital
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
              Unit langganan resmi siap kalkulasi patungan, pembagian slot akun, dan proyeksi efisiensi biaya.
            </p>
          </div>
        </div>

        {/* Global Catalog KPI Deck (Responsive: 3 columns) */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-zinc-800 grid grid-cols-3 gap-1.5 sm:gap-3 text-center select-none">
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase">INDEXED_UNITS</div>
            <div className="text-xs sm:text-sm font-bold text-white tabular-nums mt-0.5">
              {services.length} UNITS
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase">CATEGORIES</div>
            <div className="text-xs sm:text-sm font-bold text-[#DFFF00] tabular-nums mt-0.5">
              {categories.length} SECTORS
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase">ENTRY_SPLIT</div>
            <div className="text-xs sm:text-sm font-bold text-[#00E676] tabular-nums mt-0.5">
              {lowestSplitPrice > 0 ? formatRupiah(lowestSplitPrice) : "Rp 0"}
            </div>
          </div>
        </div>
      </div>

      {/* Apparatus Control Desk: Radar Search & Category Filters */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Radar Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RADAR SCAN // CARI NAMA ATAU SKU LAYANAN..."
              className="w-full bg-[#0E0F11] border border-[#26282B] focus:border-[#FF4F00] pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[9px] text-zinc-500 uppercase tracking-widest hidden sm:block shrink-0">
            FILTERED: {filteredServices.length} / {services.length}
          </div>
        </div>

        {/* Category Switches (Horizontal scroll on mobile, wrap on desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border shrink-0 transition-all active:scale-[0.98] ${
              selectedCategory === "all"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold shadow-[0_0_8px_rgba(255,79,0,0.4)]"
                : "bg-[#0E0F11] text-zinc-400 border-[#26282B] lg:hover:border-zinc-500 lg:hover:text-zinc-200"
            }`}
          >
            {selectedCategory === "all" ? "[ ALL_SECTORS ]" : "ALL_SECTORS"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border shrink-0 transition-all active:scale-[0.98] ${
                selectedCategory === cat.id
                  ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold shadow-[0_0_8px_rgba(255,79,0,0.4)]"
                  : "bg-[#0E0F11] text-zinc-400 border-[#26282B] lg:hover:border-zinc-500 lg:hover:text-zinc-200"
              }`}
            >
              {selectedCategory === cat.id ? `[ ${cat.name} ]` : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Listing Units (Responsive Grid: 1 col on mobile, 2 on md, 3 on xl) */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-500 space-y-1">
          <div className="animate-pulse">SCANNING_CATALOG_REGISTRY...</div>
          <div className="text-[10px] text-zinc-600">PLEASE_STANDBY</div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center space-y-3 text-xs text-zinc-500">
          <div>NO_SERVICES_MATCHING_FILTER</div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-[#111214] border border-zinc-700 text-[10px] text-[#FF4F00] uppercase"
          >
            [ RESET_FILTERS ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredServices.map((service) => {
            const minPerSlot = Math.round(
              service.monthly_price / (service.max_slots || 1)
            );
            return (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group flex flex-col justify-between bg-[#111214] border border-[#26282B] lg:hover:border-[#FF4F00] transition-colors p-3.5 sm:p-4 relative overflow-hidden active:bg-[#181A1D] active:scale-[0.99] duration-100"
              >
                {/* Desktop hover scanline bar (Desktop only) */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF4F00] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-150" />

                {/* Corner registration marks */}
                <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00] transition-colors">
                  +
                </div>
                <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00] transition-colors">
                  +
                </div>

                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold truncate">
                          {service.sku}
                        </span>
                        <span className="text-[9px] text-[#DFFF00] uppercase tracking-wider font-semibold truncate">
                          {service.categories?.name || "CAT.GENERAL"}
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-white lg:group-hover:text-[#FF4F00] transition-colors font-sans tracking-tight">
                        {service.name}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-[#00E676] tabular-nums">
                        {formatRupiah(service.monthly_price)}
                      </div>
                      <div className="text-[8px] text-zinc-500 uppercase">/ BULAN TOTAL</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                    {service.description || "Layanan langganan digital dengan dukungan multi-screen profile."}
                  </p>
                </div>

                {/* Card Telemetry Footer */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-800 flex items-center justify-between text-[10px]">
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">EST. SPLIT: </span>
                    <strong className="text-[#DFFF00] tabular-nums">
                      {formatRupiah(minPerSlot)}
                    </strong>
                    <span className="text-zinc-500 text-[8px]"> /SLOT ({service.max_slots} MAX)</span>
                  </div>

                  <span className="flex items-center text-[#FF4F00] font-bold text-[9px] lg:group-hover:translate-x-1 transition-transform">
                    [ HITUNG_SPLIT ] <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

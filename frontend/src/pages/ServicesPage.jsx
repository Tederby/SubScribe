import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layers, Activity, Search, X, Plus, Package, CheckCircle2, Sparkles } from "lucide-react";
import { dataService } from "../services/dataService";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSource, setDataSource] = useState("init");
  const [loading, setLoading] = useState(true);

  // New Service Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSlots, setNewSlots] = useState("4");
  const [submittingService, setSubmittingService] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        dataService.getServices(),
        dataService.getCategories(),
      ]);
      setServices(servicesRes.data || []);
      setCategories(categoriesRes.data || []);
      setDataSource(servicesRes.source);
      if (categoriesRes.data && categoriesRes.data.length > 0 && !newCatId) {
        setNewCatId(categoriesRes.data[0].id);
      }
    } catch (err) {
      console.error("Gagal membaca registry layanan:", err);
    } finally {
      setLoading(false);
    }
  }, [newCatId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim() || !newPrice) {
      alert("Field wajib belum terisi lengkap.");
      return;
    }

    try {
      setSubmittingService(true);
      setFormFeedback(null);
      const res = await dataService.createService({
        sku: newSku.trim().toUpperCase(),
        name: newName.trim(),
        description: newDesc.trim(),
        category_id: newCatId || categories[0]?.id,
        monthly_price: Number(newPrice) || 0,
        max_slots: Number(newSlots) || 1,
      });

      setFormFeedback(`BERHASIL: Layanan "${res.name}" terdaftar ke katalog.`);
      setTimeout(() => {
        setShowAddModal(false);
        setFormFeedback(null);
        setNewSku("");
        setNewName("");
        setNewDesc("");
        setNewPrice("");
        setNewSlots("4");
      }, 1200);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan layanan ke katalog.");
    } finally {
      setSubmittingService(false);
    }
  };

  const formatRupiah = useCallback((val) => currencyFormatter.format(val), []);

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
            <Activity className="w-3.5 h-3.5" /> SEC.01 // CATALOG_REGISTRY
          </span>
          <span className="text-zinc-400 tabular-nums">
            DATA_ORIGIN: {dataSource.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4F00]" /> Katalog Layanan Digital
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
              Unit langganan resmi siap kalkulasi patungan, pembagian slot akun, dan proyeksi efisiensi biaya.
            </p>
          </div>

          {/* Prominent Button to add new subscription service */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#FF4F00] lg:hover:bg-[#ff651c] text-black font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 active:bg-[#ff651c] shadow-md"
          >
            <Plus className="w-4 h-4" /> [ + TAMBAH LAYANAN KE KATALOG ]
          </button>
        </div>

        {/* Global Catalog KPI Deck (Responsive: 3 columns) */}
        <div className="mt-3.5 pt-3 border-t border-dashed border-zinc-800 grid grid-cols-3 gap-1.5 sm:gap-3 text-center select-none">
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">INDEXED_UNITS</div>
            <div className="text-xs sm:text-sm font-bold text-white tabular-nums mt-0.5">
              {services.length} UNITS
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">CATEGORIES</div>
            <div className="text-xs sm:text-sm font-bold text-[#DFFF00] tabular-nums mt-0.5">
              {categories.length} SECTORS
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-1.5">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">ENTRY_SPLIT</div>
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
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RADAR SCAN // CARI NAMA ATAU SKU LAYANAN..."
              className="w-full bg-[#0E0F11] border border-[#26282B] focus:border-[#FF4F00] pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none uppercase"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[9px] text-zinc-400 uppercase tracking-widest hidden sm:block shrink-0">
            FILTERED: {filteredServices.length} / {services.length}
          </div>
        </div>

        {/* Category Switches (Horizontal scroll on mobile, wrap on desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border shrink-0 active:bg-zinc-800 ${
              selectedCategory === "all"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#0E0F11] text-zinc-400 border-[#26282B] lg:hover:border-zinc-500 lg:hover:text-zinc-200"
            }`}
          >
            {selectedCategory === "all" ? "[ ALL_SECTORS ]" : "ALL_SECTORS"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border shrink-0 active:bg-zinc-800 ${
                selectedCategory === cat.id
                  ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                  : "bg-[#0E0F11] text-zinc-400 border-[#26282B] lg:hover:border-zinc-500 lg:hover:text-zinc-200"
              }`}
            >
              {selectedCategory === cat.id ? `[ ${cat.name} ]` : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Listing Units */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-500 space-y-1">
          <div>SCANNING_CATALOG_REGISTRY...</div>
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
                className="apparatus-card group flex flex-col justify-between bg-[#111214] border border-[#26282B] lg:hover:border-[#FF4F00] p-3.5 sm:p-4 relative overflow-hidden active:bg-[#16181B]"
              >
                {/* Desktop hover scanline bar */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF4F00] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-150" />

                {/* Corner registration marks */}
                <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00]">
                  +
                </div>
                <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600 lg:group-hover:text-[#FF4F00]">
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
                      <h2 className="text-sm sm:text-base font-bold text-white lg:group-hover:text-[#FF4F00] font-sans tracking-tight">
                        {service.name}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-[#00E676] tabular-nums">
                        {formatRupiah(service.monthly_price)}
                      </div>
                      <div className="text-[9px] text-zinc-400 uppercase">/ BULAN TOTAL</div>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                    {service.description || "Layanan langganan digital dengan dukungan multi-screen profile."}
                  </p>
                </div>

                {/* Card Telemetry Footer */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-800 flex items-center justify-between text-[10px]">
                  <div className="text-zinc-400">
                    <span className="text-zinc-400">EST. SPLIT: </span>
                    <strong className="text-[#DFFF00] tabular-nums">
                      {formatRupiah(minPerSlot)}
                    </strong>
                    <span className="text-zinc-500 text-[9px]"> ({service.max_slots} SLOTS)</span>
                  </div>

                  <span className="text-[9px] text-[#FF4F00] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    [ CALC_SPLIT &gt; ]
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah Layanan Baru ke Katalog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111214] border-2 border-[#26282B] w-full max-w-lg p-4 sm:p-5 space-y-3.5 max-h-[92vh] overflow-y-auto bracket-frame">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
              <span className="text-[#FF4F00] font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4" /> [ REGISTRY_APPARATUS // TAMBAH_LAYANAN ]
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    SKU / KODE UNIK *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DISNEY-PREM"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white uppercase focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    SEKTOR / KATEGORI *
                  </label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  NAMA RESMI LAYANAN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disney+ Hotstar Premium"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                  DESKRIPSI PAKET & FITUR
                </label>
                <input
                  type="text"
                  placeholder="e.g. Akses 4K Ultra HD simultan 3 layar profil mandiri"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    BIAYA BULANAN RESMI (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="119000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                    KAPASITAS MAKSIMAL SLOT AKUN *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newSlots}
                    onChange={(e) => setNewSlots(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              {formFeedback && (
                <div className="p-2 border border-[#00E676] bg-zinc-900 text-[#00E676] text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{formFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingService}
                className="w-full py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold uppercase tracking-wider text-xs transition-colors active:bg-[#ff651c]"
              >
                {submittingService ? "DISPATCHING_UNIT..." : "[ COMMIT_SERVICE_TO_CATALOG ]"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

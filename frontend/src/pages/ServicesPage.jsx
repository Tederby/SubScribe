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
    <div className="space-y-4 font-sans">
      {/* Spec Apparatus Header */}
      <div className="border border-[#26282B] bg-[#111214] p-3 sm:p-5 relative">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 mb-3 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#FF4F00] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF4F00]" /> KATALOG LAYANAN DIGITAL
          </span>
          <span className="text-zinc-400 font-mono">
            {services.length} Unit Terdaftar
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#FF4F00]" /> Katalog Layanan Digital
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
              Daftar paket resmi langganan digital dengan perhitungan slot akun, tarif bulanan, dan estimasi patungan per orang.
            </p>
          </div>

          {/* Button to add new subscription service */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 active:bg-[#ff651c] shadow-md rounded-sm"
          >
            <Plus className="w-4 h-4" /> [ + TAMBAH LAYANAN BARU ]
          </button>
        </div>

        {/* Global Catalog KPI Deck */}
        <div className="mt-4 pt-3 border-t border-dashed border-zinc-800 grid grid-cols-3 gap-2 sm:gap-3 text-center select-none font-mono">
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-2">
            <div className="text-[10px] text-zinc-400 uppercase">TOTAL LAYANAN</div>
            <div className="text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
              {services.length} Paket
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-2">
            <div className="text-[10px] text-zinc-400 uppercase">KATEGORI</div>
            <div className="text-sm sm:text-base font-bold text-[#DFFF00] tabular-nums mt-0.5">
              {categories.length} Sektor
            </div>
          </div>
          <div className="bg-[#0E0F11] border border-[#26282B] py-2 px-2">
            <div className="text-[10px] text-zinc-400 uppercase">MULAI PATUNGAN</div>
            <div className="text-sm sm:text-base font-bold text-[#00E676] tabular-nums mt-0.5">
              {lowestSplitPrice > 0 ? formatRupiah(lowestSplitPrice) : "Rp 0"}
            </div>
          </div>
        </div>
      </div>

      {/* Control Desk: Search & Category Filters */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CARI NAMA LAYANAN ATAU SKU..."
              className="w-full bg-[#0E0F11] border border-[#26282B] focus:border-[#FF4F00] pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none uppercase font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider hidden sm:block shrink-0">
            DITEMUKAN: {filteredServices.length} / {services.length}
          </div>
        </div>

        {/* Category Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none font-mono">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border shrink-0 transition-colors ${
              selectedCategory === "all"
                ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                : "bg-[#0E0F11] text-zinc-400 border-[#26282B] hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {selectedCategory === "all" ? "[ SEMUA SEKTOR ]" : "SEMUA SEKTOR"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold"
                  : "bg-[#0E0F11] text-zinc-400 border-[#26282B] hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {selectedCategory === cat.id ? `[ ${cat.name} ]` : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Listing Units */}
      {loading ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center text-xs text-zinc-400 space-y-1 font-mono">
          <div>MEMUAT REGISTRY LAYANAN...</div>
          <div className="text-[10px] text-zinc-500">MENGAMBIL DATA KATALOG</div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-10 text-center space-y-3 text-xs text-zinc-400 font-mono">
          <div>TIDAK ADA LAYANAN YANG SESUAI FILTER</div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 bg-[#111214] border border-zinc-700 text-xs text-[#FF4F00] uppercase hover:border-[#FF4F00]"
          >
            [ RESET FILTER ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredServices.map((service) => {
            const minPerSlot = Math.round(
              service.monthly_price / (service.max_slots || 1)
            );
            return (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group flex flex-col justify-between bg-[#111214] border border-[#26282B] hover:border-[#FF4F00] p-4 relative overflow-hidden active:bg-[#16181B] rounded-sm transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold truncate">
                          {service.sku}
                        </span>
                        <span className="text-[10px] text-[#DFFF00] uppercase tracking-wider font-semibold truncate">
                          {service.categories?.name || "CAT.GENERAL"}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white group-hover:text-[#FF4F00] font-sans tracking-tight">
                        {service.name}
                      </h2>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-sm font-bold text-[#00E676] tabular-nums">
                        {formatRupiah(service.monthly_price)}
                      </div>
                      <div className="text-[9px] text-zinc-400 uppercase">/ bulan total</div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans mt-2.5 line-clamp-2 leading-relaxed">
                    {service.description || "Layanan langganan digital dengan dukungan multi-screen profile."}
                  </p>
                </div>

                {/* Card Telemetry Footer */}
                <div className="mt-3.5 pt-3 border-t border-dashed border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div className="text-zinc-400">
                    <span>Est. Patungan: </span>
                    <strong className="text-[#DFFF00] tabular-nums">
                      {formatRupiah(minPerSlot)}
                    </strong>
                    <span className="text-zinc-400 text-[10px]"> ({service.max_slots} Slot)</span>
                  </div>

                  <span className="text-[11px] text-[#FF4F00] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Simulasi &gt;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah Layanan Baru ke Katalog (z-[70] for safe mobile stacking) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121316] border border-[#2D3035] w-full max-w-lg p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto pb-12 sm:pb-6 shadow-2xl rounded-sm">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2.5">
              <span className="text-[#FF4F00] font-mono font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4" /> [ TAMBAH LAYANAN KE KATALOG ]
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1 font-mono">
                    SKU / KODE UNIK *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DISNEY-PREM"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1 font-mono">
                    SEKTOR / KATEGORI *
                  </label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#FF4F00]"
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
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                  Nama Resmi Layanan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disney+ Hotstar Premium"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                  Deskripsi Paket & Fitur
                </label>
                <input
                  type="text"
                  placeholder="e.g. Akses 4K Ultra HD simultan 3 layar profil mandiri"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-white focus:outline-none focus:border-[#FF4F00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                    Biaya Bulanan Resmi (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="119000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                    Kapasitas Slot Akun *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newSlots}
                    onChange={(e) => setNewSlots(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2D3035] px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              {formFeedback && (
                <div className="p-2.5 border border-[#00E676] bg-zinc-900 text-[#00E676] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingService}
                className="w-full py-3 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold font-mono uppercase tracking-wider text-xs transition-colors active:bg-[#ff651c] rounded-sm"
              >
                {submittingService ? "MENYIMPAN LAYANAN..." : "[ SIMPAN KE KATALOG RESMI ]"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

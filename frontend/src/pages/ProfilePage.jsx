import { useState, useEffect } from "react";
import {
  Terminal,
  GitBranch,
  Cpu,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
  HardDrive,
  Wifi,
  Package,
} from "lucide-react";
import { dataService } from "../services/dataService";

export default function ProfilePage() {
  const [categories, setCategories] = useState([]);
  const [activeFormTab, setActiveFormTab] = useState("category"); // 'category' | 'service'

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catMessage, setCatMessage] = useState(null);

  // Service form state
  const [serviceSku, setServiceSku] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCatId, setServiceCatId] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceSlots, setServiceSlots] = useState("4");
  const [srvSubmitting, setSrvSubmitting] = useState(false);
  const [srvMessage, setSrvMessage] = useState(null);

  // Diagnostics state
  const [storageBytes, setStorageBytes] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const res = await dataService.getCategories();
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        setServiceCatId(res.data[0].id);
      }

      // Check display mode
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);

      // Estimate storage bytes
      try {
        let total = 0;
        for (let x in localStorage) {
          if (localStorage.hasOwnProperty(x)) {
            total += (localStorage[x].length + x.length) * 2;
          }
        }
        setStorageBytes(total);
      } catch {
        setStorageBytes(1024);
      }
    }
    loadInitial();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setCatSubmitting(true);
      setCatMessage(null);
      const res = await dataService.createCategory(categoryName.trim());
      setCatMessage({
        type: "success",
        text: `SUCCESS: CATEGORY "${res.name}" RECORDED [ID: ${res.id.slice(0, 8)}]`,
      });
      setCategoryName("");
      const updated = await dataService.getCategories();
      setCategories(updated.data || []);
    } catch (err) {
      console.error(err);
      setCatMessage({ type: "error", text: "FAULT: UNABLE_TO_DISPATCH_CATEGORY" });
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceSku.trim() || !serviceName.trim() || !servicePrice) return;

    try {
      setSrvSubmitting(true);
      setSrvMessage(null);
      const res = await dataService.createService({
        sku: serviceSku.trim(),
        name: serviceName.trim(),
        description: serviceDesc.trim(),
        category_id: serviceCatId,
        monthly_price: Number(servicePrice) || 0,
        max_slots: Number(serviceSlots) || 1,
      });

      setSrvMessage({
        type: "success",
        text: `SUCCESS: SERVICE "${res.name}" (${res.sku}) REGISTERED`,
      });
      setServiceSku("");
      setServiceName("");
      setServiceDesc("");
      setServicePrice("");
    } catch (err) {
      console.error(err);
      setSrvMessage({ type: "error", text: "FAULT: UNABLE_TO_REGISTER_SERVICE" });
    } finally {
      setSrvSubmitting(false);
    }
  };

  const handleFactoryReset = () => {
    dataService.resetToFactory();
    setResetConfirm(false);
    alert("APPARATUS REGISTRY RESET TO FACTORY PRESETS.");
    window.location.reload();
  };

  const handleExportJSON = () => {
    const data = dataService.exportSnapshot();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribe-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const ok = dataService.importSnapshot(content);
        if (ok) {
          alert("SNAPSHOT RESTORED SUCCESSFULLY.");
          window.location.reload();
        } else {
          alert("INVALID SNAPSHOT PAYLOAD.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-xs">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          DIAGNOSTICS & SYSTEM CONFIGURATION
        </span>
        <span className="text-[#00E676] font-bold text-[10px]">
          STATION: NOMINAL
        </span>
      </div>

      {/* Main Grid: 5 cols left, 7 cols right on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Diagnostics, Credentials & Data Maintenance */}
        <div className="lg:col-span-5 space-y-4">
          {/* Header Apparatus Diagnostics */}
          <div className="border border-[#26282B] bg-[#111214] p-4 space-y-3 relative bracket-frame">
            <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-[9px] uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-1.5 text-[#FF4F00] font-bold">
                <Terminal className="w-3.5 h-3.5" /> SEC.03 // APPARATUS_DIAGNOSTICS
              </span>
              <span className="text-[#00E676] font-bold">CORE_OK</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 bg-[#FF4F00] text-black font-black text-xl flex items-center justify-center font-mono shadow-[0_0_10px_rgba(255,79,0,0.4)]">
                S
              </div>
              <div>
                <h1 className="text-base font-bold text-white font-sans uppercase">
                  SubScribe
                </h1>
                <p className="text-[10px] text-zinc-400">
                  Utilitarian Subscription & Split-Bill Telemetry Engine
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-zinc-800 grid grid-cols-2 gap-2 text-[9px] text-zinc-400 select-none">
              <div className="bg-[#0E0F11] border border-[#26282B] p-2">
                <span className="text-zinc-500 block">BUILD_REV</span>
                <span className="text-zinc-200 font-bold">v1.2.0-utilitarian</span>
              </div>
              <div className="bg-[#0E0F11] border border-[#26282B] p-2">
                <span className="text-zinc-500 block">ENVIRONMENT</span>
                <span className="text-[#DFFF00] font-bold">
                  {isStandalone ? "STANDALONE_APK" : "DESKTOP_PWA"}
                </span>
              </div>
              <div className="bg-[#0E0F11] border border-[#26282B] p-2">
                <span className="text-zinc-500 block">CACHE_STORAGE</span>
                <span className="text-zinc-200 font-bold tabular-nums">
                  {(storageBytes / 1024).toFixed(1)} KB INDEXED
                </span>
              </div>
              <div className="bg-[#0E0F11] border border-[#26282B] p-2">
                <span className="text-zinc-500 block">NETWORK_MODE</span>
                <span className="text-[#00E676] font-bold">
                  {navigator.onLine ? "ONLINE_ACTIVE" : "OFFLINE_STANDBY"}
                </span>
              </div>
            </div>
          </div>

          {/* Developer Identification Panel */}
          <div className="border border-[#26282B] bg-[#111214] p-3.5 sm:p-4 space-y-2.5 relative">
            <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600">+</div>
            <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600">+</div>

            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FF4F00]" /> OPERATOR_CREDENTIALS
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-dashed border-zinc-900">
                <span className="text-zinc-500">OPERATOR:</span>
                <span className="text-white font-bold font-sans">Praktikan SubScribe</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-dashed border-zinc-900">
                <span className="text-zinc-500">STUDENT_NIM:</span>
                <span className="text-zinc-200 font-mono">21120120140001</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-dashed border-zinc-900">
                <span className="text-zinc-500">DEPARTMENT:</span>
                <span className="text-zinc-200">Teknik Komputer Undip 2024</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500">SOURCE_HUB:</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#DFFF00] hover:underline flex items-center gap-1 text-[10px]"
                >
                  <GitBranch className="w-3 h-3" /> [ GITHUB_REPO ]
                </a>
              </div>
            </div>
          </div>

          {/* Factory Maintenance Deck */}
          <div className="border border-[#26282B] bg-[#111214] p-3.5 sm:p-4 space-y-2.5">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#FF4F00]" /> DATA_MAINTENANCE_DECK
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="p-2.5 bg-[#0E0F11] lg:hover:bg-zinc-900 border border-[#26282B] text-zinc-300 lg:hover:text-white text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
              >
                <Download className="w-3 h-3 text-[#00E676]" /> [ EXPORT_JSON ]
              </button>

              <label className="p-2.5 bg-[#0E0F11] lg:hover:bg-zinc-900 border border-[#26282B] text-zinc-300 lg:hover:text-white text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center active:scale-[0.98]">
                <Upload className="w-3 h-3 text-[#DFFF00]" /> [ IMPORT_JSON ]
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {resetConfirm ? (
              <div className="pt-2 border-t border-dashed border-zinc-800 space-y-2">
                <p className="text-[9px] text-[#FF4F00]">
                  KONFIRMASI: Semua data custom akan dikembalikan ke data awal!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleFactoryReset}
                    className="flex-1 py-1.5 bg-[#FF4F00] text-black font-bold text-[9px] uppercase"
                  >
                    [ YA, RESET PABRIK ]
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-[9px] uppercase"
                  >
                    [ BATAL ]
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full mt-1 py-2.5 bg-[#0E0F11] lg:hover:bg-rose-950/30 border border-zinc-800 lg:hover:border-rose-700 text-zinc-400 lg:hover:text-rose-400 text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
              >
                <RotateCcw className="w-3 h-3" /> [ RESET_TO_FACTORY_PRESETS ]
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Administrative Calibration Apparatus */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#26282B] bg-[#111214] p-4 sm:p-5 space-y-3 bracket-frame">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  [ REGISTRY_ADMIN_APPARATUS ]
                </span>
                <span className="text-[9px] text-zinc-500">
                  Uji integrasi REST API backend atau tambah dataset langsung ke katalog.
                </span>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveFormTab("category")}
                  className={`px-3 py-1 text-[9px] uppercase tracking-wider border transition-colors active:scale-[0.98] ${
                    activeFormTab === "category"
                      ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold shadow-[0_0_8px_rgba(255,79,0,0.3)]"
                      : "bg-[#0E0F11] border-[#26282B] text-zinc-400 lg:hover:text-white"
                  }`}
                >
                  + KATEGORI
                </button>
                <button
                  onClick={() => setActiveFormTab("service")}
                  className={`px-3 py-1 text-[9px] uppercase tracking-wider border transition-colors active:scale-[0.98] ${
                    activeFormTab === "service"
                      ? "bg-[#FF4F00] text-black border-[#FF4F00] font-bold shadow-[0_0_8px_rgba(255,79,0,0.3)]"
                      : "bg-[#0E0F11] border-[#26282B] text-zinc-400 lg:hover:text-white"
                  }`}
                >
                  + LAYANAN
                </button>
              </div>
            </div>

            {/* Tab 1: Dispatch Category */}
            {activeFormTab === "category" ? (
              <form onSubmit={handleAddCategory} className="space-y-3 text-xs pt-1">
                <p className="text-[10px] text-zinc-400">
                  Tambah unit kategori baru ke dalam registry database (POST /api/categories).
                </p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NAMA KATEGORI (e.g. CLOUD_STORAGE)"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-2 text-white focus:outline-none focus:border-[#FF4F00] text-[11px] uppercase"
                  />
                </div>

                {catMessage && (
                  <div
                    className={`p-2.5 border text-[10px] flex items-center gap-2 ${
                      catMessage.type === "success"
                        ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                        : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                    }`}
                  >
                    {catMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{catMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="w-full py-2.5 bg-zinc-800 lg:hover:bg-[#FF4F00] lg:hover:text-black border border-zinc-700 text-[#E5E5E0] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" /> {catSubmitting ? "RECORDING..." : "[ DISPATCH_CATEGORY ]"}
                </button>
              </form>
            ) : (
              /* Tab 2: Register Service */
              <form onSubmit={handleAddService} className="space-y-3 text-xs pt-1">
                <p className="text-[10px] text-zinc-400">
                  Daftarkan layanan digital baru ke katalog (POST /api/services).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase text-zinc-500 mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      placeholder="APPLE-ONE"
                      value={serviceSku}
                      onChange={(e) => setServiceSku(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white uppercase text-[10px] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-zinc-500 mb-1">KATEGORI *</label>
                    <select
                      value={serviceCatId}
                      onChange={(e) => setServiceCatId(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#FF4F00]"
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
                  <label className="block text-[9px] uppercase text-zinc-500 mb-1">NAMA LAYANAN *</label>
                  <input
                    type="text"
                    required
                    placeholder="Apple One Premier"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-zinc-500 mb-1">DESKRIPSI FITUR</label>
                  <input
                    type="text"
                    placeholder="iCloud 2TB, Apple Music, TV+ 5 orang"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#FF4F00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase text-zinc-500 mb-1">HARGA / BULAN (RP) *</label>
                    <input
                      type="number"
                      required
                      placeholder="150000"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-zinc-500 mb-1">MAX SLOTS *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={serviceSlots}
                      onChange={(e) => setServiceSlots(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-[#26282B] px-3 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#FF4F00]"
                    />
                  </div>
                </div>

                {srvMessage && (
                  <div
                    className={`p-2.5 border text-[10px] flex items-center gap-2 ${
                      srvMessage.type === "success"
                        ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                        : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
                    }`}
                  >
                    {srvMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{srvMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={srvSubmitting}
                  className="w-full py-2.5 bg-zinc-800 lg:hover:bg-[#FF4F00] lg:hover:text-black border border-zinc-700 text-[#E5E5E0] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  <Package className="w-3.5 h-3.5" /> {srvSubmitting ? "SAVING..." : "[ REGISTER_SERVICE ]"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

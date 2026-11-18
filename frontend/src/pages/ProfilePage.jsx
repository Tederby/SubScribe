import { useState } from "react";
import { Terminal, GitBranch, Cpu, Plus, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() })
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: `SUCCESS: CATEGORY "${result.data.name}" RECORDED [ID: ${result.data.id.slice(0, 8)}]` });
        setCategoryName("");
      } else {
        setMessage({ type: "error", text: `FAILED: ${result.message || "UNKNOWN_ERROR"}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "FAULT: SERVER_CONNECTION_INTERRUPTED" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 font-mono">
      {/* Header Apparatus Diagnostics */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-[#26282B] pb-2 text-[9px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#FF4F00] font-bold">
            <Terminal className="w-3.5 h-3.5" /> SEC.03 // APPARATUS_DIAGNOSTICS
          </span>
          <span className="text-[#00E676] font-bold">STATUS: NOMINAL</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 bg-[#FF4F00] text-black font-black text-xl flex items-center justify-center font-mono">
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

        <div className="pt-2 border-t border-dashed border-zinc-800 grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
          <div>BUILD_REV: <span className="text-zinc-200">v1.2.0-utilitarian</span></div>
          <div>TARGET: <span className="text-[#DFFF00]">PWA / ANDROID_APK</span></div>
        </div>
      </div>

      {/* Developer Identification Panel */}
      <div className="border border-[#26282B] bg-[#111214] p-3.5 space-y-2.5 relative">
        <div className="absolute top-1 left-1.5 text-[8px] text-zinc-600">+</div>
        <div className="absolute top-1 right-1.5 text-[8px] text-zinc-600">+</div>

        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-[#FF4F00]" /> OPERATOR_CREDENTIALS
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center py-0.5 border-b border-dashed border-zinc-900">
            <span className="text-zinc-500">OPERATOR:</span>
            <span className="text-white font-bold font-sans">Praktikan SubScribe</span>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-dashed border-zinc-900">
            <span className="text-zinc-500">STUDENT_NIM:</span>
            <span className="text-zinc-200 font-mono">21120120140001</span>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-dashed border-zinc-900">
            <span className="text-zinc-500">DEPARTMENT:</span>
            <span className="text-zinc-200">Teknik Komputer Undip 2024</span>
          </div>

          <div className="flex justify-between items-center py-0.5">
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

      {/* API Calibration Apparatus Form */}
      <div className="border border-[#26282B] bg-[#111214] p-3.5 space-y-2.5 relative">
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">
          [ API_TEST_APPARATUS // POST_CATEGORIES ]
        </div>
        <p className="text-[10px] text-zinc-400">
          Uji integrasi REST API backend secara langsung ke tabel categories.
        </p>

        <form onSubmit={handleAddCategory} className="space-y-2 text-xs">
          <div>
            <input
              type="text"
              required
              placeholder="CATEGORY_NAME (e.g. CLOUD_STORAGE)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full bg-[#0E0F11] border border-[#26282B] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#FF4F00] uppercase text-[11px]"
            />
          </div>

          {message && (
            <div
              className={`p-2 border text-[10px] flex items-center gap-1.5 ${
                message.type === "success"
                  ? "bg-zinc-900 border-[#00E676] text-[#00E676]"
                  : "bg-zinc-900 border-[#FF4F00] text-[#FF4F00]"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-zinc-800 hover:bg-[#FF4F00] hover:text-black border border-zinc-700 text-[#E5E5E0] font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {submitting ? "RECORDING..." : "[ DISPATCH_CATEGORY ]"}
          </button>
        </form>
      </div>
    </div>
  );
}

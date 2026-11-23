import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0E0F11] text-[#E5E5E0] p-6 flex items-center justify-center font-mono">
          <div className="max-w-md w-full border border-[#FF4F00] bg-[#141517] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF4F00] font-bold text-sm border-b border-zinc-800 pb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>[ APPARATUS RUNTIME EXCEPTION ]</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Terjadi kegagalan runtime pada antarmuka. Sistem diagnostik mengisolasi crash agar tidak merusak data lokal.
            </p>

            <div className="bg-[#0E0F11] border border-zinc-800 p-2.5 text-[11px] text-rose-400 break-words font-mono">
              {this.state.error?.message || "Unknown Runtime Exception"}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-[#FF4F00] hover:bg-[#ff651c] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> REFRESH APPARATUS
              </button>
              <button
                onClick={this.handleResetState}
                className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase transition-colors"
              >
                RESET CACHE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const location = useLocation();
  const [time, setTime] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getRouteCode = () => {
    const p = location.pathname;
    if (p.startsWith("/services/")) return "SPEC // SERVICE_INSPECTOR";
    if (p.startsWith("/services")) return "RACK.01 // CATALOG_EXPLORER";
    if (p.startsWith("/groups/")) return "SPEC // GROUP_INSPECTOR";
    if (p.startsWith("/groups")) return "RACK.02 // SPLIT_MANAGER";
    if (p.startsWith("/profile")) return "RACK.03 // APPARATUS_DIAGNOSTICS";
    return "RACK.00 // STANDBY";
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#141517] text-[#E5E5E0] relative border-x border-[#26282B] shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Top Apparatus Telemetry Header */}
      <header className="px-3.5 py-2 border-b border-[#26282B] bg-[#0E0F11]/95 backdrop-blur-md flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-400 select-none sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-[#00E676] shadow-[0_0_5px_#00E676]" : "bg-[#FF4F00] animate-pulse"
            }`}
          />
          <span className="font-bold text-zinc-200">SYS.ID // SUB-01</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 tabular-nums">{time || "--:--:--"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline text-zinc-500">SPEC_REV 2.04</span>
          <span
            className={`px-1.5 py-0.5 border text-[8px] font-bold tracking-widest ${
              isOnline
                ? "bg-zinc-900 border-[#00E676]/60 text-[#00E676]"
                : "bg-zinc-900 border-[#FF4F00]/60 text-[#FF4F00]"
            }`}
          >
            {isOnline ? "NET: LIVE" : "NET: CACHE"}
          </span>
        </div>
      </header>

      {/* Secondary Location Telemetry Strip */}
      <div className="px-3.5 py-1 bg-[#111214] border-b border-[#26282B] flex items-center justify-between font-mono text-[8px] text-zinc-500 uppercase tracking-widest select-none">
        <span className="text-[#FF4F00]">{getRouteCode()}</span>
        <span className="text-zinc-600">[ 360px x VIEWPORT ]</span>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <Routes>
          <Route path="/" element={<Navigate to="/services" replace />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/services" replace />} />
        </Routes>
      </main>

      {/* Persistent Hardware Rack Navigation */}
      <BottomNav />
    </div>
  );
}

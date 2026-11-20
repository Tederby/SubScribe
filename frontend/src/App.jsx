import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import TelemetryClock from "./components/TelemetryClock";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline, { passive: true });
    window.addEventListener("offline", handleOffline, { passive: true });

    return () => {
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
    <div className="w-full max-w-md lg:max-w-7xl xl:max-w-[1400px] mx-auto min-h-screen bg-[#141517] text-[#E5E5E0] relative border-x lg:border border-[#26282B] lg:shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)] lg:my-3">
      {/* Top Apparatus Telemetry Header (Solid Opaque, Zero Backdrop Blur for 60/120 FPS scrolling) */}
      <header className="px-3.5 py-2 border-b border-[#26282B] bg-[#0E0F11] flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-300 select-none sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ring-1 ${
              isOnline ? "bg-[#00E676] ring-[#00E676]/40" : "bg-[#FF4F00] ring-[#FF4F00]/40"
            }`}
          />
          <span className="font-bold text-zinc-200">SYS.ID // SUB-01</span>
          <span className="text-zinc-600">|</span>
          <TelemetryClock />
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">APPARATUS_CONTROL_DESK</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-zinc-400">SPEC_REV 2.04</span>
          <span className="hidden lg:inline text-zinc-600">|</span>
          <span className="hidden lg:inline text-[#FF4F00] font-bold">
            {getRouteCode()}
          </span>
          <span
            className={`px-1.5 py-0.5 border text-[9px] font-bold tracking-widest ${
              isOnline
                ? "bg-zinc-900 border-[#00E676]/60 text-[#00E676]"
                : "bg-zinc-900 border-[#FF4F00]/60 text-[#FF4F00]"
            }`}
          >
            {isOnline ? "NET: LIVE" : "NET: CACHE"}
          </span>
        </div>
      </header>

      {/* Secondary Location Telemetry Strip (Mobile only) */}
      <div className="lg:hidden px-3.5 py-1 bg-[#111214] border-b border-[#26282B] flex items-center justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-widest select-none">
        <span className="text-[#FF4F00]">{getRouteCode()}</span>
        <span className="text-zinc-400">[ FIELD_TERMINAL ]</span>
      </div>

      {/* Main Workstation Container (Sidebar + Content) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Desktop Sidebar (Hidden on Mobile) */}
        <DesktopSidebar />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 p-3 sm:p-4 lg:p-6 overflow-y-auto">
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
      </div>

      {/* Persistent Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav />
    </div>
  );
}

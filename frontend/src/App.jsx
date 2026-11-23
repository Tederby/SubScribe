import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import TelemetryClock from "./components/TelemetryClock";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { dataService } from "./services/dataService";

export default function App() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState(() =>
    dataService?.getCurrentUser ? dataService.getCurrentUser() : null
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline, { passive: true });
    window.addEventListener("offline", handleOffline, { passive: true });

    const handleAuthChange = (e) => {
      setCurrentUser(e.detail?.user || dataService.getCurrentUser());
    };
    window.addEventListener("subscribe:auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("subscribe:auth-changed", handleAuthChange);
    };
  }, []);

  const getRouteCode = () => {
    const p = location.pathname;
    if (p.startsWith("/services/")) return "DETAIL // LAYANAN";
    if (p.startsWith("/services")) return "KATALOG // LAYANAN";
    if (p.startsWith("/groups/")) return "INSPEKSI // GRUP";
    if (p.startsWith("/groups")) return "CLUSTER // PATUNGAN";
    if (p.startsWith("/profile")) return "OPERATOR // DIAGNOSTIK";
    return "STANDBY";
  };

  return (
    <div className="w-full max-w-md lg:max-w-7xl xl:max-w-[1400px] mx-auto min-h-screen bg-[#141517] text-[#E5E5E0] relative border-x lg:border border-[#26282B] lg:shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)] lg:my-3">
      {/* Top Telemetry Header */}
      <header className="px-3.5 py-2 border-b border-[#26282B] bg-[#0E0F11] flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-300 select-none sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ring-2 ${
              isOnline ? "bg-[#00E676] ring-[#00E676]/30" : "bg-[#FF4F00] ring-[#FF4F00]/30"
            }`}
          />
          <span className="font-bold text-white tracking-wide">SubScribe</span>
          <span className="text-zinc-600">|</span>
          <TelemetryClock />
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 border border-[#00E676]/50 hover:border-[#00E676] text-[#00E676] text-[9px] font-bold tracking-wider rounded-xs transition-colors"
              title={`Operator aktif: ${currentUser.email}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUser.name}</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="px-2 py-0.5 bg-zinc-900 border border-[#FF4F00]/50 hover:border-[#FF4F00] text-[#FF4F00] text-[9px] font-bold tracking-wider rounded-xs transition-colors"
            >
              [ LOGIN ]
            </Link>
          )}
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-[#FF4F00] font-bold hidden sm:inline">
            {getRouteCode()}
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span
            className={`px-1.5 py-0.5 border text-[9px] font-bold tracking-wider ${
              isOnline
                ? "bg-zinc-900 border-[#00E676]/60 text-[#00E676]"
                : "bg-zinc-900 border-[#FF4F00]/60 text-[#FF4F00]"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </header>

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

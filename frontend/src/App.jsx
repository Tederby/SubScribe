import { Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#141517] text-[#E5E5E0] relative border-x border-[#26282B] shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Top Apparatus Telemetry Header */}
      <header className="px-4 py-2 border-b border-[#26282B] bg-[#0E0F11]/90 backdrop-blur-sm flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
          <span>SYS.ID // SUB-01</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">SPEC_REV 2.04</span>
          <span className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700/60 rounded text-[8px] text-[#FF4F00] font-bold">
            TELEM: OK
          </span>
        </div>
      </header>

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

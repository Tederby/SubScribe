import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Layers,
  Cpu,
  Terminal,
  Activity,
  HardDrive,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { dataService } from "../services/dataService";

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ services: 0, groups: 0, members: 0 });
  const [cacheKb, setCacheKb] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const [sRes, gRes] = await Promise.all([
        dataService.getServices(),
        dataService.getGroups(),
      ]);
      const s = sRes.data || [];
      const g = gRes.data || [];
      let totalMem = 0;
      g.forEach((item) => {
        const c = item.member_list
          ? item.member_list.split(",").map((x) => x.trim()).filter(Boolean).length
          : 0;
        totalMem += c;
      });
      setStats({ services: s.length, groups: g.length, members: totalMem });

      try {
        let total = 0;
        for (let x in localStorage) {
          if (localStorage.hasOwnProperty(x)) {
            total += (localStorage[x].length + x.length) * 2;
          }
        }
        setCacheKb((total / 1024).toFixed(1));
      } catch {
        setCacheKb("1.2");
      }
    }
    loadStats();

    // Listen to keyboard shortcuts: '1' -> /services, '2' -> /groups, '3' -> /profile
    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "1") navigate("/services");
      if (e.key === "2") navigate("/groups");
      if (e.key === "3") navigate("/profile");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const navItems = [
    {
      to: "/services",
      label: "KATALOG RESMI",
      sub: "CATALOG_EXPLORER",
      shortcut: "1",
      icon: Layers,
      count: stats.services,
    },
    {
      to: "/groups",
      label: "CLUSTER PATUNGAN",
      sub: "SPLIT_RACK_MANAGER",
      shortcut: "2",
      icon: Cpu,
      count: stats.groups,
    },
    {
      to: "/profile",
      label: "DIAGNOSTIK & ADMIN",
      sub: "APPARATUS_CALIBRATOR",
      shortcut: "3",
      icon: Terminal,
      count: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-[#26282B] bg-[#0E0F11] p-3.5 space-y-4 shrink-0 select-none">
      {/* Station Brand Panel */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2 bracket-frame">
        <div className="flex items-center justify-between text-[9px] font-mono uppercase text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span className="flex items-center gap-1.5 text-[#00E676] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] ring-1 ring-[#00E676]/50" />
            STATION // ALPHA-01
          </span>
          <span className="text-[#FF4F00] font-bold">DESKTOP_CONSOLE</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FF4F00] text-black font-black text-lg flex items-center justify-center font-mono">
            S
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans tracking-tight">
              SubScribe
            </h2>
            <div className="text-[9px] font-mono text-zinc-400">
              TELEM_ENGINE v1.2.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="space-y-1.5 flex-1">
        <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest px-1">
          // MASTER_MODULES
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between p-2.5 border transition-colors ${
                    isActive
                      ? "bg-[#181A1D] border-[#FF4F00] text-white"
                      : "bg-[#111214] border-[#26282B] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-[#141517]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Left active marker pin */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4F00]" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive
                            ? "bg-[#FF4F00] ring-1 ring-[#FF4F00]/50"
                            : "bg-zinc-700 group-hover:bg-zinc-500"
                        }`}
                      />

                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-[#FF4F00]" : "text-zinc-400 group-hover:text-zinc-300"
                        }`}
                      />

                      <div className="min-w-0">
                        <div className="text-[11px] font-mono font-bold tracking-wider truncate">
                          {item.label}
                        </div>
                        <div className="text-[9px] font-mono text-zinc-400 truncate">
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {item.count !== null && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#0E0F11] border border-zinc-800 text-zinc-300 tabular-nums">
                          {item.count}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-zinc-400 px-1 border border-zinc-700">
                        [{item.shortcut}]
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Hardware Telemetry Deck */}
      <div className="border border-[#26282B] bg-[#111214] p-3 space-y-2">
        <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex items-center justify-between">
          <span>// DESKTOP_TELEMETRY</span>
          <Activity className="w-3 h-3 text-[#00E676]" />
        </div>

        <div className="space-y-1.5 text-[9px] font-mono">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-zinc-400">CACHE_STORAGE:</span>
            <span className="text-zinc-200 tabular-nums">{cacheKb} KB</span>
          </div>

          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-zinc-400">POOLED_MEMBERS:</span>
            <span className="text-[#DFFF00] font-bold tabular-nums">
              {stats.members} HEADS
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-zinc-400">HOTKEYS:</span>
            <span className="text-zinc-300">PRESS 1, 2, 3</span>
          </div>
        </div>

        {/* Quick Launch Button */}
        <button
          onClick={() => navigate("/groups", { state: { prefillServiceName: "Custom Rack" } })}
          className="w-full mt-1 py-1.5 bg-zinc-800 hover:bg-[#FF4F00] hover:text-black border border-zinc-700 text-zinc-200 font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> [ QUICK_ADD_RACK ]
        </button>
      </div>

      {/* Operator Credential Footer */}
      <div className="text-[9px] font-mono text-zinc-400 border-t border-zinc-800 pt-2 flex items-center justify-between">
        <span>TEKNIK KOMPUTER UNDIP</span>
        <span>2024</span>
      </div>
    </aside>
  );
}

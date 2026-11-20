import { NavLink } from "react-router-dom";
import { Cpu, Layers, Terminal } from "lucide-react";
import { memo } from "react";

function BottomNav() {
  const navItems = [
    { to: "/services", label: "KATALOG", sub: "SYS.01", icon: Layers },
    { to: "/groups", label: "GRUP", sub: "SYS.02", icon: Cpu },
    { to: "/profile", label: "DIAGNOSTIK", sub: "SYS.03", icon: Terminal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0E0F11] border-t border-[#26282B] z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-3 h-16 divide-x divide-[#26282B]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 relative active:bg-[#16181B] ${
                  isActive
                    ? "bg-[#141517] text-white"
                    : "text-zinc-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Top LED Indicator */}
                  <div
                    className={`absolute top-1.5 w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#FF4F00] ring-1 ring-[#FF4F00]/50" : "bg-zinc-700"
                    }`}
                  />

                  {/* Active Scanline indicator bar at bottom */}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF4F00]" />
                  )}

                  <Icon
                    className={`w-4 h-4 mt-1.5 mb-1 ${
                      isActive ? "text-[#FF4F00]" : "text-zinc-500"
                    }`}
                  />

                  <div className="flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest">
                    <span>{isActive ? `[ ${item.label} ]` : item.label}</span>
                  </div>
                  <span className="font-mono text-[7px] text-zinc-600 tracking-tight">
                    {item.sub}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(BottomNav);

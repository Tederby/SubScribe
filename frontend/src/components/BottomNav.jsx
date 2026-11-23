import { NavLink } from "react-router-dom";
import { Cpu, Layers, Terminal } from "lucide-react";
import { memo } from "react";

function BottomNav() {
  const navItems = [
    { to: "/services", label: "Katalog", sub: "KATALOG", icon: Layers },
    { to: "/groups", label: "Grup Patungan", sub: "CLUSTER", icon: Cpu },
    { to: "/profile", label: "Operator", sub: "DIAGNOSTIK", icon: Terminal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0E0F11]/95 backdrop-blur-sm border-t border-[#26282B] z-30 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="grid grid-cols-3 h-14 divide-x divide-[#26282B]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 relative transition-colors ${
                  isActive
                    ? "bg-[#181A1D] text-white"
                    : "text-zinc-400 hover:text-zinc-200 active:bg-[#141517]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Top LED Indicator */}
                  <div
                    className={`absolute top-1 w-1.5 h-1.5 rounded-full transition-colors ${
                      isActive ? "bg-[#FF4F00] shadow-[0_0_6px_#FF4F00]" : "bg-transparent"
                    }`}
                  />

                  {/* Active bottom bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FF4F00]" />
                  )}

                  <Icon
                    className={`w-4 h-4 mt-1 mb-0.5 ${
                      isActive ? "text-[#FF4F00]" : "text-zinc-400"
                    }`}
                  />

                  <span className="font-sans text-[11px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">
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

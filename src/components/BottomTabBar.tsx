import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface TabItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface BottomTabBarProps {
  items: TabItem[];
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ items }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-4 pb-4">
      <div className="glass-strong rounded-3xl px-2 py-2 grid grid-cols-5 items-center shadow-elevated relative">
        {items.map((item, index) => {
          const active = location.pathname === item.path;
          const isCenter = index === 2; // Exact middle item for 5-item array

          if (isCenter) {
            return (
              <div key={item.label} className="flex justify-center w-full relative -top-6">
                <button
                  onClick={() => navigate(item.path)}
                  className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-[4px] border-background text-primary-foreground active:scale-95 transition-transform"
                >
                  <item.icon size={24} strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all relative w-full h-full ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
              <span className="text-[9px] font-bold uppercase tracking-wider relative z-10">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
import React from "react";
import { LayoutDashboard, Dumbbell, Settings, Users, X } from "lucide-react";
import { Badge } from "../components/ui.jsx";

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg"
        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
    }`}
  >
    <Icon size={20} />
    <span className="flex-1 text-left">{label}</span>
    {badge && <Badge variant="success" className="text-xs">{badge}</Badge>}
  </button>
);

export default function Sidebar({ open, setOpen, active, setActive }) {
  const items = [
    { key: "overview", icon: LayoutDashboard, label: "ภาพรวม", badge: null },
    { key: "programs", icon: Dumbbell, label: "โปรแกรม", badge: "24" },
    { key: "exercises", icon: Settings, label: "ท่าฝึก", badge: "132" },
    { key: "users", icon: Users, label: "ผู้ใช้", badge: "420" },
    { key: "settings", icon: Settings, label: "ตั้งค่า", badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-gray-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Dumbbell size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">FitAdmin</h2>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white md:hidden" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {items.map((item) => (
              <NavItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={active === item.key}
                onClick={() => {
                  setActive(item.key);
                  setOpen(false);
                }}
              />
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              © 2024 FitAdmin v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

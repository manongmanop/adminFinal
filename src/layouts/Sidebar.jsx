import React from "react";
import { LayoutDashboard, Dumbbell, ListChecks, MessageSquare, X } from "lucide-react";
import { Badge } from "../components/ui.jsx";
import "../css/Sidebar.css";

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick} 
    className={`nav-item ${active ? 'nav-item--active' : ''}`}
  >
    <Icon size={20} className="nav-item__icon" />
    <span className="nav-item__label">{label}</span>
    {badge && (
      <Badge variant="success" className="nav-item__badge">
        {badge}
      </Badge>
    )}
  </button>
);

export default function Sidebar({ open, setOpen, active, setActive }) {
  const items = [
    { key: "overview", icon: LayoutDashboard, label: "สรุปภาพรวมระบบ" },
    { key: "programs", icon: Dumbbell, label: "โปรแกรมออกกำลังกาย", badge: "6" },
    { key: "exercises", icon: ListChecks, label: "ท่าฝึกทั้งหมด", badge: "12" },
    { key: "feedback", icon: MessageSquare, label: "ความคิดเห็นผู้ใช้", badge: "32" }
  ];

  return (
    <>
      {open && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setOpen(false)} 
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__container">
          {/* Header */}
          <div className="sidebar__header">
            <div className="sidebar__brand">
              <div className="sidebar__logo">
                <Dumbbell size={24} />
              </div>
              <div className="sidebar__brand-text">
                <h2 className="sidebar__title">FitAdmin</h2>
                <p className="sidebar__subtitle">Control Center</p>
              </div>
            </div>
            <button 
              className="sidebar__close" 
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar__nav">
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
          <div className="sidebar__footer">
            <p className="sidebar__copyright">© 2024 FitAdmin</p>
            <p className="sidebar__version">v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

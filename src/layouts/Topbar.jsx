import React, { useState } from "react";
import { Menu, Search, Bell, User, ChevronDown } from "lucide-react";
import { Input } from "../components/ui.jsx";
import "../css/Topbar.css";

export default function Topbar({ setSidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifications = [
    { id: 1, text: "มีผู้ใช้ใหม่ 5 คน", time: "5 นาทีที่แล้ว", unread: true },
    { id: 2, text: "โปรแกรมใหม่ได้รับการอนุมัติ", time: "1 ชั่วโมงที่แล้ว", unread: true },
    { id: 3, text: "ระบบอัปเดตเสร็จสิ้น", time: "2 ชั่วโมงที่แล้ว", unread: false }
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="topbar">
      <div className="topbar__container">
        {/* Left Section */}
        <div className="topbar__left">
          <button 
            className="topbar__menu-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="topbar__brand">
            <p className="topbar__subtitle">Fitness Admin</p>
            <h1 className="topbar__title">ระบบจัดการโปรแกรมออกกำลังกาย</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="topbar__search">
          <Search size={18} className="topbar__search-icon" />
          <Input 
            placeholder="ค้นหาข้อมูลในแดชบอร์ด..." 
            className="topbar__search-input"
          />
        </div>

        {/* Right Section */}
        <div className="topbar__right">
          {/* Notifications */}
          <div className="topbar__dropdown">
            <button 
              className="topbar__icon-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="topbar__badge">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="topbar__menu topbar__menu--notifications">
                <div className="topbar__menu-header">
                  <h3>การแจ้งเตือน</h3>
                  <button className="topbar__menu-action">ทำเครื่องหมายว่าอ่านแล้ว</button>
                </div>
                <div className="topbar__menu-body">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.unread ? 'notification-item--unread' : ''}`}
                    >
                      <div className="notification-item__content">
                        <p className="notification-item__text">{notif.text}</p>
                        <span className="notification-item__time">{notif.time}</span>
                      </div>
                      {notif.unread && <span className="notification-item__dot"></span>}
                    </div>
                  ))}
                </div>
                <div className="topbar__menu-footer">
                  <button className="topbar__menu-link">ดูทั้งหมด</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="topbar__dropdown">
            <button 
              className="topbar__profile-btn"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
            >
              <div className="topbar__avatar">
                <User size={16} />
              </div>
              <span className="topbar__profile-name">Admin</span>
              <ChevronDown size={16} className="topbar__profile-arrow" />
            </button>
            
            {showProfile && (
              <div className="topbar__menu topbar__menu--profile">
                <div className="topbar__menu-header">
                  <div className="topbar__profile-info">
                    <div className="topbar__avatar topbar__avatar--lg">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="topbar__profile-info-name">Admin User</h4>
                      <p className="topbar__profile-info-email">admin@fitadmin.com</p>
                    </div>
                  </div>
                </div>
                <div className="topbar__menu-body">
                  <button className="topbar__menu-item">
                    <User size={16} />
                    <span>โปรไฟล์</span>
                  </button>
                  <button className="topbar__menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>ตั้งค่า</span>
                  </button>
                  <div className="topbar__menu-divider"></div>
                  <button className="topbar__menu-item topbar__menu-item--danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay for closing dropdowns */}
      {(showNotifications || showProfile) && (
        <div 
          className="topbar__overlay" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}
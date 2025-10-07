import React, { useState, useEffect } from "react";
import { Card } from "../components/ui.jsx";
import { 
  Dumbbell, 
  Users, 
  Settings, 
  TrendingUp, 
  Activity, 
  Calendar,
  Target,
  Award,
  BarChart3,
  Clock
} from "lucide-react";
import "../css/Overview.css";

export default function Overview() {
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const mainStats = [
    { 
      label: "โปรแกรมทั้งหมด", 
      value: "24", 
      icon: <Dumbbell size={24} />, 
      color: "emerald",
      change: "+12%",
      trend: "up",
      description: "เพิ่มขึ้นจากเดือนที่แล้ว"
    },
    { 
      label: "ท่าฝึกในระบบ", 
      value: "132", 
      icon: <Settings size={24} />, 
      color: "blue",
      change: "+8%",
      trend: "up",
      description: "ท่าฝึกใหม่ที่เพิ่มเข้ามา"
    },
    { 
      label: "ผู้ใช้งาน", 
      value: "420", 
      icon: <Users size={24} />, 
      color: "purple",
      change: "+23%",
      trend: "up",
      description: "ผู้ใช้งานที่ลงทะเบียนใหม่"
    },
  ];

  const activityStats = [
    {
      label: "เซสชันวันนี้",
      value: "47",
      icon: <Activity size={20} />,
      color: "orange",
      subtitle: "เซสชันการออกกำลังกาย"
    },
    {
      label: "เป้าหมายที่บรรลุ",
      value: "89%",
      icon: <Target size={20} />,
      color: "green",
      subtitle: "ของเป้าหมายรายสัปดาห์"
    },
    {
      label: "ชั่วโมงการฝึก",
      value: "156",
      icon: <Clock size={20} />,
      color: "cyan",
      subtitle: "ชั่วโมงในสัปดาห์นี้"
    },
    {
      label: "ความสำเร็จ",
      value: "94%",
      icon: <Award size={20} />,
      color: "yellow",
      subtitle: "อัตราการบรรลุเป้าหมาย"
    }
  ];

  const quickStats = [
    { label: "โปรแกรมยอดนิยม", value: "HIIT Training" },
    { label: "ท่าฝึกที่ใช้มากที่สุด", value: "Push-ups" },
    { label: "เวลาเฉลี่ยต่อเซสชัน", value: "45 นาที" },
    { label: "การเติบโตรายเดือน", value: "+15.3%" }
  ];
  
  return (
    <div className="overview-container">
      {/* Header Section */}
      <div className="overview-header">
        <div className="header-content">
          <div className="header-icon">
            <BarChart3 size={28} />
          </div>
          <div className="header-text">
            <h1 className="page-title">ภาพรวมระบบ</h1>
            <p className="page-subtitle">
              ข้อมูลสถิติและการวิเคราะห์ประสิทธิภาพของระบบ
            </p>
          </div>
        </div>
        <div className="header-badge">
          <Calendar size={16} />
          <span>อัปเดตล่าสุด: วันนี้</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="main-stats-grid">
        {mainStats.map((stat, i) => (
          <Card key={i} className={`main-stat-card ${animateStats ? 'animate' : ''}`}>
            <div className="stat-card-content">
              <div className="stat-info">
                <div className="stat-header">
                  <p className="stat-label">{stat.label}</p>
                  <div className={`trend-indicator trend-${stat.trend}`}>
                    <TrendingUp size={14} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="stat-value-container">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-description">{stat.description}</p>
                </div>
              </div>
              <div className={`stat-icon-container stat-${stat.color}`}>
                <div className="stat-icon-bg"></div>
                <div className="stat-icon">
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="section-header">
        <h2 className="section-title">กิจกรรมในวันนี้</h2>
        <p className="section-subtitle">สถิติการใช้งานและประสิทธิภาพ</p>
      </div>

      <div className="activity-stats-grid">
        {activityStats.map((stat, i) => (
          <Card key={i} className="activity-stat-card">
            <div className="activity-stat-content">
              <div className={`activity-icon activity-${stat.color}`}>
                {stat.icon}
              </div>
              <div className="activity-info">
                <div className="activity-value">{stat.value}</div>
                <div className="activity-label">{stat.label}</div>
                <div className="activity-subtitle">{stat.subtitle}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Overview */}
      <div className="quick-overview-section">
        <div className="section-header">
          <h2 className="section-title">ข้อมูลสรุป</h2>
        </div>
        <div className="quick-stats-grid">
          {quickStats.map((stat, i) => (
            <div key={i} className="quick-stat-item">
              <div className="quick-stat-label">{stat.label}</div>
              <div className="quick-stat-value">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="performance-section">
        <Card className="performance-card">
          <div className="performance-header">
            <h3 className="performance-title">ประสิทธิภาพระบบ</h3>
            <div className="performance-status status-excellent">
              <div className="status-dot"></div>
              <span>ดีเยี่ยม</span>
            </div>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <div className="metric-label">ความเสถียร</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '98%' }}></div>
              </div>
              <div className="metric-value">98%</div>
            </div>
            <div className="metric">
              <div className="metric-label">ความเร็วการตอบสนอง</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '94%' }}></div>
              </div>
              <div className="metric-value">94%</div>
            </div>
            <div className="metric">
              <div className="metric-label">ความพึงพอใจผู้ใช้</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '96%' }}></div>
              </div>
              <div className="metric-value">96%</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
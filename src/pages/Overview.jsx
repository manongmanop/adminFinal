import React, { useState, useEffect } from "react";
import { Card } from "../components/ui.jsx";
import {
  Dumbbell,
  Users,
  Settings,
  Activity,
  Target,
  Award,
  BarChart3,
  Clock,
  Zap
} from "lucide-react";
import "../css/Overview.css";
import { fetchCounts } from "../api/client";

export default function Overview() {
  const [animateStats, setAnimateStats] = useState(false);
  const [counts, setCounts] = useState({ programs: 0, exercises: 0, users: 0 });

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const toNumber = (v) => {
      const n = typeof v === 'string' ? Number(v) : v;
      return Number.isFinite(n) ? n : 0;
    };

    async function loadCounts() {
      try {
        const data = await fetchCounts();
        if (!mounted) return;
        setCounts({
          programs: toNumber(data?.programs),
          exercises: toNumber(data?.exercises),
          users: toNumber(data?.users),
        });
      } catch {
        if (!mounted) return;
        setCounts({ programs: 0, exercises: 0, users: 0 });
      }
    }

    loadCounts();

    return () => { mounted = false; };
  }, []);

  const mainStats = [
    { 
      label: "โปรแกรมทั้งหมด", 
      value: counts.programs, 
      icon: Dumbbell, 
      color: "emerald",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    { 
      label: "ท่าฝึกในระบบ", 
      value: counts.exercises, 
      icon: Settings, 
      color: "blue",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    },
    { 
      label: "ผู้ใช้งาน", 
      value: counts.users, 
      icon: Users, 
      color: "purple",
      bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
    },
  ];

  const activityStats = [
    {
      label: "เซสชันวันนี้",
      value: "47",
      icon: Activity,
      color: "orange",
      subtitle: "เซสชันการออกกำลังกาย"
    },
    {
      label: "เป้าหมายที่บรรลุ",
      value: "89%",
      icon: Target,
      color: "green",
      subtitle: "ของเป้าหมายรายสัปดาห์"
    },
    {
      label: "ชั่วโมงการฝึก",
      value: "156",
      icon: Clock,
      color: "cyan",
      subtitle: "ชั่วโมงในสัปดาห์นี้"
    },
    {
      label: "ความสำเร็จ",
      value: "94%",
      icon: Award,
      color: "yellow",
      subtitle: "อัตราการบรรลุเป้าหมาย"
    }
  ];

  const quickStats = [
    { 
      label: "โปรแกรมยอดนิยม", 
      value: "HIIT Training",
      icon: Award,
      color: "emerald"
    },
    { 
      label: "ท่าฝึกนิยมที่สุด", 
      value: "Push-ups",
      icon: Zap,
      color: "blue"
    },
    { 
      label: "เวลาเฉลี่ยต่อโปรแกรม", 
      value: "10 นาที",
      icon: Clock,
      color: "purple"
    }
  ];

  const performanceMetrics = [
    { label: "ความเสถียร", value: 98, color: "emerald" },
    { label: "ความเร็วการตอบสนอง", value: 94, color: "blue" },
    { label: "ความพึงพอใจผู้ใช้", value: 96, color: "purple" }
  ];
  
  return (
    <div className="overview">
      {/* Header Section */}
      <div className="overview__header">
        <div className="overview__header-content">
          <div className="overview__header-icon">
            <BarChart3 size={28} />
          </div>
          <div className="overview__header-text">
            <h1 className="overview__title">สรุปภาพรวมระบบ</h1>
            <p className="overview__subtitle">
              ข้อมูลสถิติและการวิเคราะห์ประสิทธิภาพของระบบ
            </p>
          </div>
        </div>
        {/* <div className="overview__header-badge">
          <div className="overview__status-dot"></div>
          <span>ระบบทำงานปกติ</span>
        </div> */}
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {mainStats.map((stat, i) => {
          const IconComponent = stat.icon;
          const numericValue = typeof stat.value === 'number' ? stat.value : Number(stat.value);
          const displayValue = Number.isFinite(numericValue) ? numericValue : 0;

          return (
            <Card 
              key={i} 
              className={`stat-card stat-card--${stat.color} ${animateStats ? 'stat-card--animate' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="stat-card__header">
                <div className="stat-card__label-container">
                  <p className="stat-card__label">{stat.label}</p>
                </div>
              </div>
              
              <div className="stat-card__body">
                <p className="stat-card__value">{displayValue}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Overview */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title">ข้อมูลสรุป</h2>
        </div>
        
        <div className="quick-grid">
          {quickStats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={i} className={`quick-card quick-card--${stat.color}`}>
                <div className="quick-card__icon">
                  <IconComponent size={18} />
                </div>
                <div className="quick-card__content">
                  <div className="quick-card__label">{stat.label}</div>
                  <div className="quick-card__value">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

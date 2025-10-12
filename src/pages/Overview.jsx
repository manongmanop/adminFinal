import React, { useState, useEffect } from "react";
import { Card } from "../components/ui.jsx";
import { 
  Dumbbell, 
  Users, 
  Settings, 
  TrendingUp, 
  Activity, 
  Target,
  Award,
  BarChart3,
  Clock,
  Zap,
  CheckCircle2
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
      trend: "+12%",
      description: "เพิ่มขึ้นจากเดือนที่แล้ว"
    },
    { 
      label: "ท่าฝึกในระบบ", 
      value: counts.exercises, 
      icon: Settings, 
      color: "blue",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      trend: "+8%",
      description: "ท่าฝึกใหม่ที่เพิ่มเข้ามา"
    },
    { 
      label: "ผู้ใช้งาน", 
      value: counts.users, 
      icon: Users, 
      color: "purple",
      bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
      trend: "+24%",
      description: "ผู้ใช้งานที่ลงทะเบียนใหม่"
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
      icon: TrendingUp,
      color: "emerald"
    },
    { 
      label: "ท่าฝึกที่ใช้มากที่สุด", 
      value: "Push-ups",
      icon: Zap,
      color: "blue"
    },
    { 
      label: "เวลาเฉลี่ยต่อเซสชัน", 
      value: "45 นาที",
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
        <div className="overview__header-badge">
          <div className="overview__status-dot"></div>
          <span>ระบบทำงานปกติ</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {mainStats.map((stat, i) => {
          const IconComponent = stat.icon;
          const numericValue = typeof stat.value === 'number' ? stat.value : Number(stat.value);
          const noData = !Number.isFinite(numericValue) || numericValue <= 0;
          const descText = noData ? "ไม่มีข้อมูล" : stat.description;
          return (
            <Card 
              key={i} 
              className={`stat-card stat-card--${stat.color} ${animateStats ? 'stat-card--animate' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="stat-card__header">
                <div className="stat-card__label-container">
                  <p className="stat-card__label">{stat.label}</p>
                  {!noData && (
                    <div className={`stat-card__trend stat-card__trend--${stat.color}`}>
                      <TrendingUp size={14} />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                <div 
                  className="stat-card__icon"
                  style={{ background: stat.bgGradient }}
                >
                  <IconComponent size={24} />
                </div>
              </div>
              
              <div className="stat-card__body">
                <p className="stat-card__value">{Number.isFinite(numericValue) ? numericValue : 0}</p>
                <p className="stat-card__description">{descText}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Stats */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title">กิจกรรมในวันนี้</h2>
          <p className="section__subtitle">สถิติการใช้งานและประสิทธิภาพ</p>
        </div>

        <div className="activity-grid">
          {activityStats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <Card key={i} className="activity-card">
                <div className="activity-card__content">
                  <div className={`activity-card__icon activity-card__icon--${stat.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="activity-card__info">
                    <div className="activity-card__value">{stat.value}</div>
                    <div className="activity-card__label">{stat.label}</div>
                    <div className="activity-card__subtitle">{stat.subtitle}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Overview */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title">ข้อมูลสรุป</h2>
          <p className="section__subtitle">ข้อมูลสำคัญที่ควรทราบ</p>
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

      {/* Performance Indicators */}
      <div className="section">
        <Card className="performance-card">
          <div className="performance-card__header">
            <h3 className="performance-card__title">ประสิทธิภาพระบบ</h3>
            <div className="performance-card__status">
              <div className="performance-card__status-dot"></div>
              <span>ดีเยี่ยม</span>
            </div>
          </div>
          
          <div className="performance-card__metrics">
            {performanceMetrics.map((metric, i) => (
              <div key={i} className="metric">
                <div className="metric__info">
                  <div className="metric__label">{metric.label}</div>
                  <div className="metric__value">{metric.value}%</div>
                </div>
                <div className="metric__bar">
                  <div 
                    className={`metric__fill metric__fill--${metric.color}`}
                    style={{ width: `${metric.value}%` }}
                  >
                    <div className="metric__fill-shine"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import "../css/Overview.css";

const MOCK_AREA_DATA = [
  { date: "14 ก.พ.", sessions: 45 },
  { date: "15 ก.พ.", sessions: 52 },
  { date: "16 ก.พ.", sessions: 38 },
  { date: "17 ก.พ.", sessions: 65 },
  { date: "18 ก.พ.", sessions: 48 },
  { date: "19 ก.พ.", sessions: 70 },
  { date: "20 ก.พ.", sessions: 85 },
];

const MOCK_BAR_DATA = [
  { name: "Push-ups", accuracy: 92 },
  { name: "Squats", accuracy: 88 },
  { name: "Lunges", accuracy: 85 },
  { name: "Plank", accuracy: 95 },
  { name: "Jumping Jacks", accuracy: 90 },
];

const MOCK_RECENT_SESSIONS = [
  { id: 1, user: "Somchai D.", exercise: "Push-ups", date: "20 ก.พ. 10:30", accuracy: "94%", status: "success" },
  { id: 2, user: "Manee R.", exercise: "Squats", date: "20 ก.พ. 09:15", accuracy: "88%", status: "success" },
  { id: 3, user: "Piti K.", exercise: "Lunges", date: "19 ก.พ. 18:45", accuracy: "72%", status: "warning" },
  { id: 4, user: "Chujai M.", exercise: "Plank", date: "19 ก.พ. 17:20", accuracy: "96%", status: "success" },
  { id: 5, user: "Weera T.", exercise: "Push-ups", date: "18 ก.พ. 08:00", accuracy: "45%", status: "error" },
];

export default function Overview() {
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const statCards = [
    {
      label: "เซสชันทั้งหมด",
      value: "2,450",
      icon: Activity,
      color: "blue",
      trend: "+12% จากสัปดาห์ก่อน"
    },
    {
      label: "ความแม่นยำ AI เฉลี่ย",
      value: "91%",
      icon: Target,
      color: "emerald",
      trend: "+2% จากสัปดาห์ก่อน"
    },
    {
      label: "ท่าที่ตรวจจับ",
      value: "15",
      icon: CheckCircle2,
      color: "purple",
      trend: "รองรับท่าใหม่ 2 ท่า"
    },
    {
      label: "แจ้งเตือนข้อผิดพลาด",
      value: "24",
      icon: AlertCircle,
      color: "orange",
      trend: "-5% จากสัปดาห์ก่อน"
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="status-badge status-badge--success">สำเร็จ</span>;
      case 'warning':
        return <span className="status-badge status-badge--warning">ปกติ (ต่ำกว่าเกณฑ์)</span>;
      case 'error':
        return <span className="status-badge status-badge--error">มีข้อผิดพลาด</span>;
      default:
        return <span className="status-badge">ไม่ทราบ</span>;
    }
  };

  return (
    <div className="overview">
      {/* Header Section */}
      <div className="overview__header">
        <div className="overview__header-content">
          <div className="overview__header-icon">
            <BarChart3 size={28} />
          </div>
          <div className="overview__header-text">
            <h1 className="overview__title">Admin Dashboard</h1>
            <p className="overview__subtitle">
              ระบบตรวจจับท่าออกกำลังกาย - ภาพรวมและสถิติการใช้งาน
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        {statCards.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={i}
              className={`stat-card stat-card--${stat.color} ${animateStats ? 'stat-card--animate' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="stat-card__header">
                <div className="stat-card__icon-wrap">
                  <IconComponent size={24} />
                </div>
                <span className="stat-card__trend-text">{stat.trend}</span>
              </div>
              <div className="stat-card__body">
                <p className="stat-card__value">{stat.value}</p>
                <p className="stat-card__label">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        {/* Area Chart: 7-day history */}
        <div className="chart-card">
          <div className="chart-card__header">
            <h2 className="chart-card__title">ประวัติเซสชัน (7 วันย้อนหลัง)</h2>
          </div>
          <div className="chart-card__body render-chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={MOCK_AREA_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="sessions" name="เซสชัน" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Accuracy per exercise */}
        <div className="chart-card">
          <div className="chart-card__header">
            <h2 className="chart-card__title">ความแม่นยำเฉลี่ยแต่ละท่า (%)</h2>
          </div>
          <div className="chart-card__body render-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="accuracy" name="ความแม่นยำ (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="dashboard-table-container">
        <div className="table-card">
          <div className="table-card__header">
            <h2 className="table-card__title">เซสชันล่าสุด (Recent Sessions)</h2>
          </div>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ผู้ใช้</th>
                  <th>ท่าออกกำลังกาย</th>
                  <th>วันที่/เวลา</th>
                  <th>ความแม่นยำ</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_SESSIONS.map((session) => (
                  <tr key={session.id}>
                    <td className="font-medium text-dark">{session.user}</td>
                    <td>{session.exercise}</td>
                    <td className="text-muted">{session.date}</td>
                    <td className="font-semibold">{session.accuracy}</td>
                    <td>{getStatusBadge(session.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

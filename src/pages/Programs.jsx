import React, { useMemo, useState } from "react";
import Table from "../components/Table.jsx";
import { Input, Button, Badge, Modal } from "../components/ui.jsx";
import ProgramForm from "../forms/ProgramForm.jsx";
import { 
  Plus, 
  Search, 
  Filter,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Play,
  Edit,
  Trash2,
  MoreVertical,
  Activity
} from "lucide-react";
import "../css/Programs.css";

export default function Programs() {
  const [items, setItems] = useState([
    { 
      id: "p1", 
      name: "Beginner Core Strength", 
      level: "Beginner", 
      goal: "Fat Loss", 
      workouts: 8,
      duration: "4 สัปดาห์",
      participants: 124,
      rating: 4.8,
      status: "active",
      description: "โปรแกรมสร้างกล้ามเนื้อหน้าท้องสำหรับผู้เริ่มต้น"
    },
    { 
      id: "p2", 
      name: "Advanced Strength Training", 
      level: "Advanced", 
      goal: "Muscle Gain", 
      workouts: 12,
      duration: "8 สัปดาห์",
      participants: 89,
      rating: 4.9,
      status: "active",
      description: "โปรแกรมเสริมสร้างกล้ามเนื้อระดับสูง"
    },
    { 
      id: "p3", 
      name: "Cardio Endurance Pro", 
      level: "Intermediate", 
      goal: "Endurance", 
      workouts: 10,
      duration: "6 สัปดาห์",
      participants: 156,
      rating: 4.7,
      status: "active",
      description: "โปรแกรมเสริมสร้างความแข็งแกร่งของหัวใจ"
    },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or grid

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = selectedLevel === "all" || item.level === selectedLevel;
      const matchesGoal = selectedGoal === "all" || item.goal === selectedGoal;
      return matchesQuery && matchesLevel && matchesGoal;
    });
  }, [items, query, selectedLevel, selectedGoal]);

  const levelToVariant = (lvl) =>
    lvl === "Beginner" ? "success" : lvl === "Intermediate" ? "warning" : "destructive";

  const goalToColor = (goal) => {
    switch (goal) {
      case "Fat Loss": return "orange";
      case "Muscle Gain": return "blue";
      case "Endurance": return "purple";
      default: return "gray";
    }
  };

  const columns = [
    { 
      header: "โปรแกรม", 
      accessor: "name",
      cell: (r) => (
        <div className="program-name-cell">
          <div className="program-icon">
            <Activity size={16} />
          </div>
          <div>
            <div className="program-title">{r.name}</div>
            <div className="program-description">{r.description}</div>
            <div className="program-meta">
              <span className="program-duration">
                <Calendar size={12} />
                {r.duration}
              </span>
              <span className="program-rating">
                <Star size={12} />
                {r.rating}
              </span>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "ระดับ", 
      accessor: "level", 
      cell: (r) => <Badge variant={levelToVariant(r.level)} className="level-badge">{r.level}</Badge> 
    },
    { 
      header: "เป้าหมาย", 
      accessor: "goal", 
      cell: (r) => (
        <Badge className={`goal-badge goal-${goalToColor(r.goal)}`}>
          <Target size={12} />
          {r.goal}
        </Badge>
      )
    },
    { 
      header: "เวิร์กเอาต์", 
      accessor: "workouts", 
      cell: (r) => (
        <div className="workout-count">
          <span className="workout-number">{r.workouts}</span>
          <span className="workout-label">เซสชัน</span>
        </div>
      )
    },
    {
      header: "ผู้เข้าร่วม",
      accessor: "participants",
      cell: (r) => (
        <div className="participants-count">
          <Users size={14} />
          <span>{r.participants}</span>
        </div>
      )
    },
    {
      header: "จัดการ",
      accessor: "actions",
      cell: (r) => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" className="action-btn">
            <Play size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="action-btn">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="action-btn action-btn-danger">
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  const stats = [
    { label: "โปรแกรมทั้งหมด", value: items.length, icon: <Activity size={20} /> },
    { label: "ผู้เข้าร่วมทั้งหมด", value: items.reduce((sum, item) => sum + item.participants, 0), icon: <Users size={20} /> },
    { label: "คะแนนเฉลี่ย", value: (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1), icon: <Star size={20} /> },
  ];

  const levelOptions = [
    { value: "all", label: "ทุกระดับ" },
    { value: "Beginner", label: "เริ่มต้น" },
    { value: "Intermediate", label: "กลาง" },
    { value: "Advanced", label: "สูง" }
  ];

  const goalOptions = [
    { value: "all", label: "ทุกเป้าหมาย" },
    { value: "Fat Loss", label: "ลดน้ำหนัก" },
    { value: "Muscle Gain", label: "เพิ่มกล้ามเนื้อ" },
    { value: "Endurance", label: "ความอดทน" }
  ];

  const handleCreate = (values) => {
    const newProgram = {
      id: `p${Date.now()}`,
      ...values,
      workouts: Math.floor(Math.random() * 15) + 5,
      duration: `${Math.floor(Math.random() * 8) + 4} สัปดาห์`,
      participants: Math.floor(Math.random() * 200) + 50,
      rating: (Math.random() * 1 + 4).toFixed(1),
      status: "active",
      description: `โปรแกรม${values.name}ที่ออกแบบมาเพื่อ${values.goal}`
    };
    setItems((prev) => [...prev, newProgram]);
    setModalOpen(false);
  };

  return (
    <div className="programs-container">
      {/* Header Section */}
      <div className="programs-header">
        <div className="header-content">
          <div className="header-icon">
            <Activity size={32} />
          </div>
          <div className="header-text">
            <h1 className="page-title">โปรแกรมฟิตเนส</h1>
            <p className="page-subtitle">
              จัดการและสร้างโปรแกรมฟิตเนสที่เหมาะสมกับทุกระดับ
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={() => setModalOpen(true)} size="lg" className="create-button">
            <Plus size={18} />
            สร้างโปรแกรมใหม่
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="ค้นหาโปรแกรมที่ต้องการ..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              className="filter-select"
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Target size={16} />
            <select 
              className="filter-select"
              value={selectedGoal} 
              onChange={(e) => setSelectedGoal(e.target.value)}
            >
              {goalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-toggle">
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="view-btn"
          >
            ตาราง
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="view-btn"
          >
            กริด
          </Button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <div className="results-count">
          พบ {filtered.length} โปรแกรม
          {query && ` จากการค้นหา "${query}"`}
          {(selectedLevel !== "all" || selectedGoal !== "all") && " ที่กรองแล้ว"}
        </div>
        <div className="results-actions">
          <Button variant="ghost" size="sm">
            เรียงตาม: ความนิยม
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {viewMode === "table" ? (
        <div className="table-container">
          <Table 
            columns={columns} 
            data={filtered} 
            page={page} 
            pageSize={5} 
            onPageChange={setPage} 
          />
        </div>
      ) : (
        <div className="grid-container">
          {filtered.slice(page * 6, (page + 1) * 6).map((program) => (
            <div key={program.id} className="program-card">
              <div className="program-card-header">
                <div className="program-card-icon">
                  <Activity size={20} />
                </div>
                <div className="program-card-actions">
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
              <div className="program-card-content">
                <h3 className="program-card-title">{program.name}</h3>
                <p className="program-card-description">{program.description}</p>
                <div className="program-card-badges">
                  <Badge variant={levelToVariant(program.level)} size="sm">
                    {program.level}
                  </Badge>
                  <Badge className={`goal-badge goal-${goalToColor(program.goal)}`} size="sm">
                    {program.goal}
                  </Badge>
                </div>
              </div>
              <div className="program-card-stats">
                <div className="card-stat">
                  <Calendar size={14} />
                  <span>{program.duration}</span>
                </div>
                <div className="card-stat">
                  <Users size={14} />
                  <span>{program.participants}</span>
                </div>
                <div className="card-stat">
                  <Star size={14} />
                  <span>{program.rating}</span>
                </div>
              </div>
              <div className="program-card-footer">
                <Button size="sm" className="card-action-btn">
                  <Play size={14} />
                  เริ่มโปรแกรม
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="สร้างโปรแกรมฟิตเนสใหม่">
        <ProgramForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
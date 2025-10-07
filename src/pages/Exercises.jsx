import React, { useState } from "react";
import Table from "../components/Table.jsx";
import { Input, Button, Badge } from "../components/ui.jsx";
import { Plus, Search, Dumbbell, Filter, MoreVertical } from "lucide-react";
import "../css/Exercises.css";

export default function Exercises() {
  const [items] = useState([
    { id: "e1", name: "Squat", type: "reps", value: 12, muscle: "Lower Body", difficulty: "Beginner" },
    { id: "e2", name: "Plank", type: "time", value: "00:45", muscle: "Core", difficulty: "Intermediate" },
    { id: "e3", name: "Push-up", type: "reps", value: 15, muscle: "Upper Body", difficulty: "Beginner" },
    { id: "e4", name: "Burpees", type: "reps", value: 10, muscle: "Full Body", difficulty: "Advanced" },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filtered = items.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = selectedFilter === "all" || item.muscle === selectedFilter;
    return matchesQuery && matchesFilter;
  });

  const getDifficultyBadgeVariant = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "success";
      case "Intermediate": return "warning";
      case "Advanced": return "destructive";
      default: return "default";
    }
  };

  const columns = [
    { 
      header: "ท่าฝึก", 
      accessor: "name",
      cell: (r) => (
        <div className="exercise-name-cell">
          <div className="exercise-icon">
            <Dumbbell size={16} />
          </div>
          <div>
            <div className="exercise-title">{r.name}</div>
            <div className="exercise-difficulty">
              <Badge variant={getDifficultyBadgeVariant(r.difficulty)} size="sm">
                {r.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "ประเภท", 
      accessor: "type", 
      cell: (r) => (
        <Badge variant={r.type === 'reps' ? 'success' : 'warning'} className="type-badge">
          {r.type === 'reps' ? 'จำนวนครั้ง' : 'เวลา'}
        </Badge>
      ) 
    },
    { 
      header: "ค่าเริ่มต้น", 
      accessor: "value", 
      cell: (r) => <span className="value-display">{r.value}</span> 
    },
    { 
      header: "กล้ามเนื้อหลัก", 
      accessor: "muscle",
      cell: (r) => <span className="muscle-tag">{r.muscle}</span>
    },
    {
      header: "จัดการ",
      accessor: "actions",
      cell: (r) => (
        <Button variant="ghost" size="sm" className="action-button">
          <MoreVertical size={16} />
        </Button>
      )
    }
  ];

  const filterOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "Upper Body", label: "ส่วนบน" },
    { value: "Lower Body", label: "ส่วนล่าง" },
    { value: "Core", label: "หน้าท้อง" },
    { value: "Full Body", label: "ทั้งตัว" }
  ];

  return (
    <div className="exercises-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-icon">
            <Dumbbell size={32} />
          </div>
          <div className="header-text">
            <h1 className="page-title">ท่าฝึกออกกำลังกาย</h1>
            <p className="page-subtitle">
              จัดการท่าฝึกและแบบฝึกหัดของคุณ
            </p>
          </div>
        </div>
        <Button size="lg" className="add-button">
          <Plus size={18} />
          เพิ่มท่าฝึกใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{items.length}</div>
          <div className="stat-label">ท่าฝึกทั้งหมด</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{items.filter(i => i.difficulty === 'Beginner').length}</div>
          <div className="stat-label">ระดับเริ่มต้น</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{items.filter(i => i.type === 'reps').length}</div>
          <div className="stat-label">แบบจำนวนครั้ง</div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input 
              placeholder="ค้นหาท่าฝึกที่ต้องการ..." 
              className="search-input" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="filter-container">
          <Filter size={16} />
          <select 
            className="filter-select"
            value={selectedFilter} 
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span className="results-count">
          พบ {filtered.length} ท่าฝึก
          {query && ` จากการค้นหา "${query}"`}
          {selectedFilter !== "all" && ` ในหมวด ${filterOptions.find(f => f.value === selectedFilter)?.label}`}
        </span>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <Table 
          columns={columns} 
          data={filtered} 
          page={page} 
          pageSize={5} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
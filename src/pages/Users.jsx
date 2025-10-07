import React, { useState, useMemo } from "react";
import Table from "../components/Table.jsx";
import { Input, Badge, Button, Modal } from "../components/ui.jsx";
import { 
  Search, 
  Users as UsersIcon,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";
import "../css/Users.css";

export default function Users() {
  const [items] = useState([
    { 
      id: "u1", 
      name: "Nina Anderson", 
      email: "nina@example.com", 
      phone: "+66 81 234 5678",
      plans: 2, 
      status: "active", 
      role: "premium",
      joined: "2024-01-15",
      lastActive: "2024-12-20",
      totalWorkouts: 45,
      streakDays: 12,
      avatar: null,
      location: "Bangkok, Thailand",
      completionRate: 89
    },
    { 
      id: "u2", 
      name: "Arthit Suksamai", 
      email: "arthit@example.com", 
      phone: "+66 89 876 5432",
      plans: 1, 
      status: "inactive", 
      role: "basic",
      joined: "2024-02-20",
      lastActive: "2024-12-18",
      totalWorkouts: 23,
      streakDays: 0,
      avatar: null,
      location: "Chiang Mai, Thailand",
      completionRate: 67
    },
    { 
      id: "u3", 
      name: "Sarah Wilson", 
      email: "sarah@example.com", 
      phone: "+66 92 345 6789",
      plans: 3, 
      status: "active", 
      role: "vip",
      joined: "2024-03-10",
      lastActive: "2024-12-20",
      totalWorkouts: 78,
      streakDays: 25,
      avatar: null,
      location: "Phuket, Thailand",
      completionRate: 95
    },
    { 
      id: "u4", 
      name: "John Smith", 
      email: "john@example.com", 
      phone: "+66 94 567 8901",
      plans: 2, 
      status: "pending", 
      role: "basic",
      joined: "2024-12-19",
      lastActive: "2024-12-19",
      totalWorkouts: 2,
      streakDays: 2,
      avatar: null,
      location: "Pattaya, Thailand",
      completionRate: 100
    },
  ]);
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((user) => {
      const matchesQuery = [user.name, user.email, user.phone].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [items, query, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter(u => u.status === "active").length;
    const premium = items.filter(u => u.role === "premium" || u.role === "vip").length;
    const avgWorkouts = Math.round(items.reduce((sum, u) => sum + u.totalWorkouts, 0) / total);
    
    return [
      { label: "ผู้ใช้ทั้งหมด", value: total, icon: <UsersIcon size={20} />, color: "blue" },
      { label: "ใช้งานอยู่", value: active, icon: <UserCheck size={20} />, color: "green" },
      { label: "สมาชิกพรีเมียม", value: premium, icon: <Crown size={20} />, color: "yellow" },
      { label: "เวิร์กเอาต์เฉลี่ย", value: avgWorkouts, icon: <Activity size={20} />, color: "purple" }
    ];
  }, [items]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "default";
      case "pending": return "warning";
      case "banned": return "destructive";
      default: return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active": return "ใช้งาน";
      case "inactive": return "ไม่ใช้งาน";
      case "pending": return "รอดำเนินการ";
      case "banned": return "ถูกระงับ";
      default: return status;
    }
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case "vip": return "destructive";
      case "premium": return "warning";
      case "basic": return "default";
      default: return "default";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "vip": return "VIP";
      case "premium": return "พรีเมียม";
      case "basic": return "ทั่วไป";
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "vip": return <Crown size={12} />;
      case "premium": return <Star size={12} />;
      case "basic": return <Shield size={12} />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "วันนี้";
    if (diffDays === 1) return "เมื่อวาน";
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  const columns = [
    { 
      header: "ผู้ใช้", 
      accessor: "name",
      cell: (user) => (
        <div className="user-cell">
          <div className="user-avatar">
            <UsersIcon size={16} />
          </div>
          <div className="user-info">
            <div className="user-name">
              {user.name}
              {user.role !== 'basic' && (
                <span className="user-role-icon">
                  {getRoleIcon(user.role)}
                </span>
              )}
            </div>
            <div className="user-email">{user.email}</div>
            <div className="user-meta">
              <span className="user-location">
                <MapPin size={10} />
                {user.location.split(',')[0]}
              </span>
              <span className="user-joined">
                เข้าร่วม {formatDate(user.joined)}
              </span>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "สถานะ", 
      accessor: "status", 
      cell: (user) => (
        <div className="status-cell">
          <Badge variant={getStatusVariant(user.status)} className="status-badge">
            {getStatusLabel(user.status)}
          </Badge>
          <div className="last-active">
            <Clock size={10} />
            {formatDate(user.lastActive)}
          </div>
        </div>
      )
    },
    {
      header: "แพ็กเกจ",
      accessor: "role",
      cell: (user) => (
        <div className="role-cell">
          <Badge variant={getRoleVariant(user.role)} className="role-badge">
            {getRoleIcon(user.role)}
            {getRoleLabel(user.role)}
          </Badge>
          <div className="plans-count">
            {user.plans} โปรแกรม
          </div>
        </div>
      )
    },
    {
      header: "ประสิทธิภาพ",
      accessor: "performance",
      cell: (user) => (
        <div className="performance-cell">
          <div className="performance-stats">
            <div className="stat-item">
              <Activity size={12} />
              <span>{user.totalWorkouts}</span>
            </div>
            <div className="stat-item">
              <TrendingUp size={12} />
              <span>{user.streakDays}</span>
            </div>
          </div>
          <div className="completion-rate">
            <div className="rate-bar">
              <div 
                className="rate-fill" 
                style={{ width: `${user.completionRate}%` }}
              ></div>
            </div>
            <span className="rate-text">{user.completionRate}%</span>
          </div>
        </div>
      )
    },
    {
      header: "จัดการ",
      accessor: "actions",
      cell: (user) => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" className="action-btn">
            <Eye size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="action-btn">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="action-btn">
            <Mail size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="action-btn action-btn-danger">
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: "all", label: "ทุกสถานะ" },
    { value: "active", label: "ใช้งาน" },
    { value: "inactive", label: "ไม่ใช้งาน" },
    { value: "pending", label: "รอดำเนินการ" },
    { value: "banned", label: "ถูกระงับ" }
  ];

  const roleOptions = [
    { value: "all", label: "ทุกระดับ" },
    { value: "basic", label: "ทั่วไป" },
    { value: "premium", label: "พรีเมียม" },
    { value: "vip", label: "VIP" }
  ];

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header">
        <div className="header-content">
          <div className="header-icon">
            <UsersIcon size={32} />
          </div>
          <div className="header-text">
            <h1 className="page-title">จัดการผู้ใช้งาน</h1>
            <p className="page-subtitle">
              ติดตามและจัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" className="export-btn">
            <Download size={16} />
            ส่งออกข้อมูล
          </Button>
          <Button onClick={() => setShowUserModal(true)} className="add-user-btn">
            <UserPlus size={16} />
            เพิ่มผู้ใช้
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="ค้นหาผู้ใช้ด้วยชื่อ อีเมล หรือเบอร์โทร..."
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
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Crown size={16} />
            <select 
              className="filter-select"
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roleOptions.map(option => (
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
          >
            ตาราง
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            กริด
          </Button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <div className="results-count">
          พบ {filtered.length} ผู้ใช้
          {query && ` จากการค้นหา "${query}"`}
          {(statusFilter !== "all" || roleFilter !== "all") && " ที่กรองแล้ว"}
        </div>
        <div className="results-actions">
          {selectedUsers.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedUsers.length} รายการที่เลือก</span>
              <Button variant="outline" size="sm">
                <Mail size={14} />
                ส่งอีเมล
              </Button>
              <Button variant="outline" size="sm">
                <UserX size={14} />
                ระงับการใช้งาน
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="table-container">
          <Table 
            columns={columns} 
            data={filtered} 
            page={page} 
            pageSize={10} 
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div className="grid-container">
          {filtered.slice(page * 12, (page + 1) * 12).map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-card-avatar">
                  <UsersIcon size={20} />
                </div>
                <div className="user-card-status">
                  <Badge variant={getStatusVariant(user.status)} size="sm">
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="user-card-content">
                <div className="user-card-name">
                  {user.name}
                  {user.role !== 'basic' && (
                    <span className="user-role-icon">
                      {getRoleIcon(user.role)}
                    </span>
                  )}
                </div>
                <div className="user-card-email">{user.email}</div>
                <div className="user-card-meta">
                  <div className="meta-item">
                    <MapPin size={12} />
                    <span>{user.location}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={12} />
                    <span>เข้าร่วม {formatDate(user.joined)}</span>
                  </div>
                </div>
              </div>

              <div className="user-card-stats">
                <div className="card-stat">
                  <div className="stat-value">{user.totalWorkouts}</div>
                  <div className="stat-label">เวิร์กเอาต์</div>
                </div>
                <div className="card-stat">
                  <div className="stat-value">{user.streakDays}</div>
                  <div className="stat-label">วันต่อเนื่อง</div>
                </div>
                <div className="card-stat">
                  <div className="stat-value">{user.completionRate}%</div>
                  <div className="stat-label">สำเร็จ</div>
                </div>
              </div>

              <div className="user-card-footer">
                <Button size="sm" variant="outline" className="card-action-btn">
                  <Eye size={14} />
                  ดูรายละเอียด
                </Button>
                <Button size="sm" variant="ghost" className="card-menu-btn">
                  <MoreVertical size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal placeholder */}
      <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title="เพิ่มผู้ใช้ใหม่">
        <div className="user-form">
          <p className="text-gray-400">ฟอร์มเพิ่มผู้ใช้จะอยู่ที่นี่</p>
        </div>
      </Modal>
    </div>
  );
}
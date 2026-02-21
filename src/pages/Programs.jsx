import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, Plus, Target, Flame, Edit2, PlaySquare, X, Trash2, GripVertical, Save, Upload, PlusCircle
} from "lucide-react";
import "../css/Programs.css";
import useToasts from "../hooks/useToasts.js";
import { fetchPrograms, fetchExercises, createProgram, updateProgram, deleteProgram } from "../api/client.js";

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
  return `/uploads/${src}`;
};

// Map categories to themes
const getCategoryColor = (cat) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("cardio")) return "blue";
  if (c.includes("strength")) return "green";
  if (c.includes("flexibility") || c.includes("yoga")) return "purple";
  if (c.includes("hiit")) return "red";
  return "yellow";
};

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programForm, setProgramForm] = useState(null);
  const [allExercises, setAllExercises] = useState([]);

  // Drag State for WorkoutList
  const [draggedIdx, setDraggedIdx] = useState(null);

  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchPrograms(), fetchExercises()]).then(([progData, exeData]) => {
      if (!mounted) return;
      setPrograms(progData || []);
      setAllExercises(exeData || []);
      setLoading(false);
    }).catch(err => {
      if (!mounted) return;
      console.error(err);
      pushToast({ type: 'error', title: 'ไม่สามารถดึงข้อมูลได้' });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Filter Categories
  const categories = useMemo(() => {
    const cats = new Set(programs.map(p => p.category).filter(Boolean));
    return ["ทั้งหมด", ...Array.from(cats)];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "ทั้งหมด" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [programs, searchTerm, selectedCategory]);

  const openModal = (program = null) => {
    if (program) {
      setProgramForm({ ...program, workoutList: [...(program.workoutList || [])] });
    } else {
      setProgramForm({
        id: `draft-${Date.now()}`,
        name: "",
        description: "",
        duration: "",
        caloriesBurned: 0,
        category: "",
        image: "",
        workoutList: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProgramForm(null);
  };

  const handleFieldChange = (field, val) => {
    setProgramForm(prev => ({ ...prev, [field]: val }));
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = "move";
    // Adding class with slight delay to avoid drag image disappearing
    setTimeout(() => {
      const el = document.getElementById(`dnd-item-${index}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e, index) => {
    const el = document.getElementById(`dnd-item-${index}`);
    if (el) el.classList.remove('dragging');
    setDraggedIdx(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;

    setProgramForm(prev => {
      const list = [...prev.workoutList];
      const items = list.splice(draggedIdx, 1);
      list.splice(dropIdx, 0, items[0]);
      return { ...prev, workoutList: list };
    });
  };

  const handleSaveModal = async () => {
    if (!programForm.name) {
      pushToast({ type: 'error', title: 'โปรดระบุชื่อโปรแกรม' });
      return;
    }
    try {
      setLoading(true);
      const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
      let saved;
      if (isObjectId(programForm.id)) {
        saved = await updateProgram(programForm.id, programForm);
      } else {
        saved = await createProgram(programForm);
      }

      setPrograms(prev => {
        const found = prev.find(p => p.id === saved.id);
        if (found) return prev.map(p => p.id === saved.id ? saved : p);
        return [saved, ...prev.filter(p => !isObjectId(p.id) && p.id !== programForm.id)];
      });
      pushToast({ type: 'success', title: 'บันทึกสำเร็จ' });
      closeModal();
    } catch (e) {
      console.error(e);
      pushToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      const resp = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('upload failed');
      const data = await resp.json();
      if (data.url) handleFieldChange('image', data.url);
    } catch (err) {
      console.error(err);
      pushToast({ type: 'error', title: 'อัปโหลดรูปล้มเหลว' });
    }
  };

  const handleDeleteExercise = (idx) => {
    setProgramForm(prev => {
      const list = [...prev.workoutList];
      list.splice(idx, 1);
      return { ...prev, workoutList: list };
    });
  };

  return (
    <div className="programs-page">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <h4 className="toast__title">{t.title}</h4>
            <button className="toast__close" onClick={() => dismissToast(t.id)}>×</button>
            {t.message && <p className="toast__message">{t.message}</p>}
          </div>
        ))}
      </div>

      {/* Page Header Banner */}
      <div className="prog-header-banner">
        <div className="prog-header-left">
          <div className="prog-header-icon">
            <Target size={28} />
          </div>
          <div>
            <h1 className="prog-header-title">โปรแกรมออกกำลังกาย</h1>
            <p className="prog-header-desc">คุณสามารถค้นหา เพิ่ม และจัดการลำดับท่าออกกำลังกาย รวมถึงดู Feedback ได้ที่นี่</p>
          </div>
        </div>
        <button className="prog-btn-create" onClick={() => openModal()}>
          <Plus size={18} /> Создать программу (สร้างโปรแกรม)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="prog-filter-bar">
        <div className="prog-search-wrap">
          <Search size={18} className="prog-search-icon" />
          <input
            className="prog-search-input"
            placeholder="ค้นหาชื่อโปรแกรม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="prog-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`prog-pill ${selectedCategory === cat ? 'active' : ''}`}
              data-color={getCategoryColor(cat)}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="prog-count">
          แสดง {filteredPrograms.length} โปรแกรม
        </div>
      </div>

      {/* Program Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>กำลังโหลดระบบ...</div>
      ) : (
        <div className="prog-grid">
          {filteredPrograms.map(prog => {
            const fb = prog.DataFeedback || { easy: 45, medium: 35, hard: 20 };
            const total = fb.easy + fb.medium + fb.hard || 1;
            const pE = (fb.easy / total) * 100;
            const pM = (fb.medium / total) * 100;
            const pH = (fb.hard / total) * 100;

            const coverSrc = resolveImageUrl(prog.image) || 'https://via.placeholder.com/400x140?text=No+Image';

            return (
              <div key={prog.id} className="prog-card" onClick={() => openModal(prog)}>
                <div className="prog-card-cover">
                  <img src={coverSrc} alt="cover" className="prog-card-image" />
                  <div className="prog-card-gradient" />
                  {prog.category && (
                    <div className="prog-badge" style={{ backgroundColor: `var(--c-${getCategoryColor(prog.category)})` }}>
                      {prog.category}
                    </div>
                  )}
                  <button className="prog-btn-edit-float" onClick={(e) => { e.stopPropagation(); openModal(prog); }}>
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="prog-card-body">
                  <h3 className="prog-card-title">{prog.name}</h3>
                  <p className="prog-card-desc">{prog.description || "ไม่มีคำอธิบาย"}</p>

                  <div className="prog-card-stats">
                    <div className="prog-stat-item">
                      <span className="prog-stat-val"><Target size={14} /> {prog.duration || '0'}m</span>
                      <span className="prog-stat-label">เวาลา</span>
                    </div>
                    <div className="prog-stat-item">
                      <span className="prog-stat-val"><Flame size={14} color="var(--c-yellow)" /> {prog.caloriesBurned || 0}</span>
                      <span className="prog-stat-label">แคลอรี</span>
                    </div>
                    <div className="prog-stat-item">
                      <span className="prog-stat-val"><PlaySquare size={14} color="var(--c-blue)" /> {(prog.workoutList || []).length}</span>
                      <span className="prog-stat-label">จำนวนท่า</span>
                    </div>
                  </div>

                  <div className="prog-feedback-wrap">
                    <span className="prog-feedback-label">Feedback อัตราส่วน:</span>
                    <div className="prog-feedback-bar">
                      <div className="fb-green" style={{ width: `${pE}%` }} title={`ง่าย ${pE.toFixed(0)}%`} />
                      <div className="fb-yellow" style={{ width: `${pM}%` }} title={`ปานกลาง ${pM.toFixed(0)}%`} />
                      <div className="fb-red" style={{ width: `${pH}%` }} title={`ยาก ${pH.toFixed(0)}%`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal View */}
      {isModalOpen && programForm && (
        <div className="prog-modal-overlay" onMouseDown={closeModal}>
          <div className="prog-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="prog-modal-cover">
              {programForm.image && (
                <img src={resolveImageUrl(programForm.image)} alt="cov" className="prog-modal-cover-img" />
              )}
              <div className="prog-modal-fade" />
              <button className="prog-modal-close" onClick={closeModal}><X size={20} /></button>
              <div className="prog-modal-header-info">
                <div>
                  <h2 className="prog-modal-title">{programForm.name || "โปรแกรมใหม่"}</h2>
                  <p className="prog-modal-subtitle">
                    {programForm.workoutList?.length || 0} ท่า • {programForm.duration || 0} นาที • {programForm.caloriesBurned || 0} kcal
                  </p>
                </div>
                <label className="prog-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  เปลี่ยนรูปปก
                  <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="prog-modal-body">
              {/* Block 1: Basic Info Form */}
              <div>
                <h3 className="modal-block-title">ข้อมูลพื้นฐาน</h3>
                <div className="prog-form-grid">
                  <div className="prog-input-group">
                    <label className="prog-label">ชื่อโปรแกรม</label>
                    <input className="prog-input" value={programForm.name} onChange={(e) => handleFieldChange('name', e.target.value)} placeholder="ระบุชื่อโปรแกรม" />
                  </div>
                  <div className="prog-input-group">
                    <label className="prog-label">หมวดหมู่</label>
                    <input className="prog-input" value={programForm.category || ''} onChange={(e) => handleFieldChange('category', e.target.value)} placeholder="เช่น Cardio, Strength" />
                  </div>
                  <div className="prog-input-group">
                    <label className="prog-label">ระยะเวลา (ข้อความ)</label>
                    <input className="prog-input" value={programForm.duration || ''} onChange={(e) => handleFieldChange('duration', e.target.value)} placeholder="เช่น 30 นาที" />
                  </div>
                  <div className="prog-input-group">
                    <label className="prog-label">จำนวนแคลอรีเผาผลาญ</label>
                    <input type="number" className="prog-input" value={programForm.caloriesBurned || ''} onChange={(e) => handleFieldChange('caloriesBurned', e.target.value)} />
                  </div>
                  <div className="prog-input-group prog-form-grid full" style={{ gridColumn: '1 / -1' }}>
                    <label className="prog-label">คำอธิบายโปรแกรม</label>
                    <textarea className="prog-input" value={programForm.description || ''} onChange={(e) => handleFieldChange('description', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Block 2: Feedback Stats (Mocked or computed if available) */}
              {programForm.id && !programForm.id.startsWith("draft-") && (
                <div>
                  <h3 className="modal-block-title">สถิติ Feedback จากผู้ใช้งาน</h3>
                  <div className="prog-feedback-stats">
                    {(() => {
                      const fb = programForm.DataFeedback || { easy: 45, medium: 35, hard: 20 };
                      const tot = fb.easy + fb.medium + fb.hard || 1;
                      return (
                        <>
                          <div className="prog-fb-card easy">
                            <span className="prog-fb-val">{Math.round((fb.easy / tot) * 100)}%</span>
                            <span className="prog-fb-text">ง่าย (Easy)</span>
                            <div className="prog-feedback-bar"><div className="fb-green" style={{ width: '100%' }} /></div>
                          </div>
                          <div className="prog-fb-card medium">
                            <span className="prog-fb-val">{Math.round((fb.medium / tot) * 100)}%</span>
                            <span className="prog-fb-text">พอดี (Medium)</span>
                            <div className="prog-feedback-bar"><div className="fb-yellow" style={{ width: '100%' }} /></div>
                          </div>
                          <div className="prog-fb-card hard">
                            <span className="prog-fb-val">{Math.round((fb.hard / tot) * 100)}%</span>
                            <span className="prog-fb-text">ยาก (Hard)</span>
                            <div className="prog-feedback-bar"><div className="fb-red" style={{ width: '100%' }} /></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Block 3: Workout List with Drag & Drop */}
              <div>
                <h3 className="modal-block-title">
                  รายชื่อท่าออกกำลังกาย
                  {/* Just showing how one would add new, no real picker logic yet beyond original if requested, but prompt said "Block 3 Drag&Drop row" */}
                </h3>

                <div className="prog-dnd-list">
                  {programForm.workoutList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>ยังไม่มีการเพิ่มท่าในโปรแกรมนี้</div>
                  ) : (
                    programForm.workoutList.map((workout, idx) => (
                      <div
                        key={`${workout.id}-${idx}`}
                        id={`dnd-item-${idx}`}
                        className="prog-dnd-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={(e) => handleDragEnd(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                      >
                        <div className="prog-dnd-handle"><GripVertical size={20} /></div>
                        <div className="prog-dnd-index">{idx + 1}.</div>
                        <div className="prog-dnd-icon">
                          {workout.image ? <img src={resolveImageUrl(workout.image)} alt="w" /> : <PlaySquare size={24} />}
                        </div>
                        <div className="prog-dnd-info">
                          <p className="prog-dnd-name">{workout.name}</p>
                          <p className="prog-dnd-muscle">กล้ามเนื้อหลัก: {(workout.muscles || []).join(', ') || '-'}</p>
                        </div>
                        <div className="prog-dnd-badge">
                          {workout.type === 'time' ? `${workout.duration} วินาที` : `${workout.value} ครั้ง`}
                        </div>
                        <button className="prog-dnd-delete" onClick={() => handleDeleteExercise(idx)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="prog-modal-footer">
                <button className="prog-btn-secondary" onClick={closeModal}>ยกเลิก</button>
                <button className="prog-btn-save" onClick={handleSaveModal}>บันทึกโปรแกรม</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Dumbbell,
  Target,
  Flame,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Save,
  X,
  XCircle,
  CheckCircle,
  PlaySquare,
  Image as ImageIcon
} from "lucide-react";
import "../css/Exercises.css";
import { fetchExercises, createExercise, updateExercise, deleteExercise } from "../api/client.js";

/* ===== Upload helper ===== */
async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${t || res.status}`);
  }
  return res.json(); // { url, filename, mimetype, size, type }
}

const muscleOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "arms", label: "แขน" },
  { value: "biceps", label: "กล้ามแขน" },
  { value: "core", label: "แกนกลาง" },
  { value: "back", label: "หลัง" },
  { value: "legs", label: "ต้นขา" },
  { value: "glutes", label: "สะโพก" },
  { value: "hamstrings", label: "หลังขา" },
  { value: "chest", label: "อก" },
  { value: "shoulders", label: "ไหล่" },
];

/* ===== UI helpers ===== */
const emptyExercise = () => ({
  id: `draft-${Date.now()}`,
  name: "",
  description: "",
  tips: "",
  type: "reps",       // reps | time
  value: 10,          // for reps
  duration: 30,       // for time (sec)
  caloriesBurned: 0,
  video: "",
  image: "",
  muscles: [],
});

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
  return `/uploads/${src}`;
};

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (opt) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...opt }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchExercises()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.map((exercise) => ({
            ...exercise,
            muscles: Array.isArray(exercise.muscles) ? exercise.muscles : [],
          }))
          : [];
        setExercises(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("ไม่สามารถดึงข้อมูลท่าฝึก", err);
        setError("ไม่สามารถโหลดข้อมูลท่าฝึกได้");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredExercises = useMemo(() => {
    const term = query.toLowerCase();
    return exercises.filter((ex) => {
      const name = (ex.name || "").toLowerCase();
      const desc = (ex.description || "").toLowerCase();
      const mus = Array.isArray(ex.muscles) ? ex.muscles : [];
      const matchSearch = name.includes(term) || desc.includes(term) || mus.some(m => m.toLowerCase().includes(term));
      const matchMuscle = muscleFilter === "all" || mus.map(m => m.toLowerCase()).includes(muscleFilter.toLowerCase());
      return matchSearch && matchMuscle;
    });
  }, [exercises, muscleFilter, query]);

  const muscleLookup = useMemo(() => {
    return muscleOptions.reduce((acc, opt) => {
      if (opt.value !== "all") acc[opt.value] = opt.label;
      return acc;
    }, {});
  }, []);

  const openModal = (exercise = null) => {
    if (exercise) {
      setDraft({
        ...exercise,
        value: exercise.value ?? 10,
        duration: exercise.duration ?? 30,
        caloriesBurned: exercise.caloriesBurned ?? 0,
        muscles: Array.isArray(exercise.muscles) ? [...exercise.muscles] : [],
      });
    } else {
      setDraft(emptyExercise());
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDraft(null);
  };

  const handleFieldChange = (field, val) => {
    setDraft(prev => ({ ...prev, [field]: val }));
  };

  const handleCheckbox = (muscleValue, checked) => {
    setDraft(d => {
      const set = new Set(d.muscles || []);
      if (checked) set.add(muscleValue);
      else set.delete(muscleValue);
      return { ...d, muscles: Array.from(set) };
    });
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await uploadFile(file);
      handleFieldChange("image", res.url);
      pushToast({ type: "success", title: "อัปโหลดภาพเรียบร้อย" });
    } catch (err) {
      pushToast({ type: "error", title: "อัปโหลดภาพไม่สำเร็จ", message: err.message });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo(true);
      const res = await uploadFile(file);
      handleFieldChange("video", res.url);
      pushToast({ type: "success", title: "อัปโหลดวิดีโอเรียบร้อย" });
    } catch (err) {
      pushToast({ type: "error", title: "อัปโหลดวิดีโอไม่สำเร็จ", message: err.message });
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      return pushToast({ type: "error", title: "ตรวจสอบข้อมูล", message: "โปรดระบุชื่อท่าฝึก" });
    }
    try {
      const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
      const payload = draft.type === "reps" ? { ...draft, duration: null } : { ...draft, value: null };

      if (!isObjectId(draft.id)) {
        const created = await createExercise(payload);
        setExercises(prev => [created, ...prev]);
        pushToast({ type: "success", title: "เพิ่มท่าฝึกสำเร็จ" });
      } else {
        const updated = await updateExercise(draft.id, payload);
        setExercises(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
        pushToast({ type: "success", title: "ปรับปรุงท่าฝึกสำเร็จ" });
      }
      closeModal();
    } catch (e) {
      pushToast({ type: "error", title: "เกิดข้อผิดพลาด", message: e.message });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`ยืนยันการลบท่าฝึก "${draft.name}" ใช่หรือไม่?`)) return;
    try {
      await deleteExercise(draft.id);
      setExercises(prev => prev.filter(ex => ex.id !== draft.id));
      pushToast({ type: "success", title: "ลบท่าฝึกเรียบร้อย" });
      closeModal();
    } catch (e) {
      pushToast({ type: "error", title: "การลบล้มเหลว", message: e.message });
    }
  };

  return (
    <div className="exercises-page">
      {/* Toasts (Re-using classes from Programs or define minimal local)*/}
      <div className="toast-container" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: 'white', padding: '1rem', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderLeft: t.type === 'error' ? '4px solid #ef4444' : '4px solid #10b981', minWidth: 250, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>{t.title}</h4>
              {t.message && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{t.message}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="ex-header-banner">
        <div className="ex-header-left">
          <div className="ex-header-icon">
            <Dumbbell size={28} />
          </div>
          <div>
            <h1 className="ex-header-title">คลังท่าออกกำลังกาย</h1>
            <p className="ex-header-desc">คุณสามารถเพิ่ม ดู หรือแก้ไขรายละเอียดของท่าต่างๆ ได้ที่นี่</p>
          </div>
        </div>
        <button className="ex-btn-create" onClick={() => openModal()}>
          <Plus size={18} /> เพิ่มท่าฝึก
        </button>
      </div>

      {/* Filter Bar */}
      <div className="ex-filter-bar">
        <div className="ex-search-wrap">
          <Search size={18} className="ex-search-icon" />
          <input
            className="ex-search-input"
            placeholder="ค้นหาชื่อ หรือ กล้ามเนื้อ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="ex-pills">
          {muscleOptions.slice(0, 7).map(opt => (
            <button
              key={opt.value}
              className={`ex-pill ${muscleFilter === opt.value ? 'active' : ''}`}
              onClick={() => setMuscleFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ex-count">
          จำนวน {filteredExercises.length} ท่า
        </div>
      </div>

      {/* Content */}
      {
        loading ? (
          <div className="ex-message-box">กำลังโหลดระบบ...</div>
        ) : error ? (
          <div className="ex-message-box" style={{ color: "var(--c-red)" }}>{error}</div>
        ) : filteredExercises.length === 0 ? (
          <div className="ex-message-box">ไม่พบท่าออกกำลังกายที่้นหา</div>
        ) : (
          <div className="ex-grid">
            {filteredExercises.map(ex => {
              const coverSrc = resolveImageUrl(ex.image) || 'https://via.placeholder.com/400x160?text=No+Preview';
              return (
                <div key={ex.id} className="ex-card" onClick={() => openModal(ex)}>
                  <div className="ex-card-cover">
                    <img src={coverSrc} alt="Preview" className="ex-card-image" />
                    <div className="ex-card-gradient" />
                    <div className={`ex-badge ${ex.type === 'reps' ? 'reps' : 'time'}`}>
                      {ex.type === 'reps' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {ex.type === 'reps' ? 'นับแบบครั้ง' : 'นับแบบเวลา'}
                    </div>
                    <button className="ex-btn-floating" onClick={(e) => { e.stopPropagation(); openModal(ex); }}>
                      <Edit2 size={16} />
                    </button>
                  </div>

                  <div className="ex-card-body">
                    <h3 className="ex-card-title">{ex.name}</h3>
                    <div className="ex-card-muscles">
                      {ex.muscles.length > 0 ? (
                        ex.muscles.slice(0, 3).map(m => (
                          <span key={m} className="ex-muscle-tag">{muscleLookup[m] || m}</span>
                        ))
                      ) : (
                        <span className="ex-muscle-tag" style={{ background: '#f1f5f9', color: '#94a3b8' }}>ไม่มี</span>
                      )}
                      {ex.muscles.length > 3 && <span className="ex-muscle-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>+{ex.muscles.length - 3}</span>}
                    </div>
                    <p className="ex-card-desc">{ex.description || "ไม่มีคำอธิบาย"}</p>

                    <div className="ex-card-stats">
                      <div className="ex-stat-item">
                        <span className="ex-stat-val">
                          {ex.type === 'reps' ? `${ex.value || 0}` : `${ex.duration || 0}s`}
                        </span>
                        <span className="ex-stat-label">เป้าหมาย</span>
                      </div>
                      <div className="ex-stat-item">
                        <span className="ex-stat-val"><Flame size={14} color="var(--c-orange)" /> {ex.caloriesBurned || 0}</span>
                        <span className="ex-stat-label">แคลอรี</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Modal View & Edit */}
      {
        isModalOpen && draft && (
          <div className="ex-modal-overlay" onMouseDown={closeModal}>
            <div className="ex-modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="ex-modal-cover">
                {draft.image ? (
                  <img src={resolveImageUrl(draft.image)} alt="cov" className="ex-modal-cover-img" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <ImageIcon size={48} opacity={0.5} />
                  </div>
                )}
                <div className="ex-modal-fade" />
                <button className="ex-modal-close" onClick={closeModal}><X size={20} /></button>
                <div className="ex-modal-header-info">
                  <div>
                    <h2 className="ex-modal-title">{draft.name || "ท่าออกกำลังกายใหม่"}</h2>
                    <p className="ex-modal-subtitle">
                      เผาผลาญ {draft.caloriesBurned || 0} kcal / {draft.type === "reps" ? "รอบ" : "เซ็ต"}
                    </p>
                  </div>
                  <label className="ex-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <ImageIcon size={14} /> เปลี่ยนภาพ
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={onPickImage} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div className="ex-modal-body">
                {/* Block 1: Basic Information */}
                <div>
                  <h3 className="ex-block-title">ข้อมูลพื้นฐาน</h3>
                  <div className="ex-form-grid">
                    <div className="ex-input-group">
                      <label className="ex-label">ชื่อท่าฝึก</label>
                      <input className="ex-input" value={draft.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder="เช่น Squat" />
                    </div>
                    <div className="ex-input-group">
                      <label className="ex-label">รูปแบบการนับ</label>
                      <select className="ex-input" value={draft.type} onChange={(e) => handleFieldChange("type", e.target.value)}>
                        <option value="reps">จำนวนครั้ง (Reps)</option>
                        <option value="time">เวลา (Time)</option>
                      </select>
                    </div>

                    {draft.type === "reps" ? (
                      <div className="ex-input-group">
                        <label className="ex-label">จำนวนครั้ง</label>
                        <input type="number" className="ex-input" value={draft.value || ''} onChange={(e) => handleFieldChange("value", Number(e.target.value))} />
                      </div>
                    ) : (
                      <div className="ex-input-group">
                        <label className="ex-label">เวลา (วินาที)</label>
                        <input type="number" className="ex-input" value={draft.duration || ''} onChange={(e) => handleFieldChange("duration", Number(e.target.value))} />
                      </div>
                    )}

                    <div className="ex-input-group">
                      <label className="ex-label">แคลอรีเป้าหมาย</label>
                      <input type="number" className="ex-input" value={draft.caloriesBurned || ''} onChange={(e) => handleFieldChange("caloriesBurned", Number(e.target.value))} />
                    </div>

                    <div className="ex-input-group ex-form-grid full" style={{ gridColumn: '1 / -1' }}>
                      <label className="ex-label">รายละเอียด / คำอธิบาย</label>
                      <textarea className="ex-input" value={draft.description} onChange={(e) => handleFieldChange("description", e.target.value)} placeholder="วิธีการทำท่าออกกำลังกายเบื้องต้น" />
                    </div>

                    <div className="ex-input-group ex-form-grid full" style={{ gridColumn: '1 / -1' }}>
                      <label className="ex-label">จุดที่ต้องระวัง (Tips)</label>
                      <textarea className="ex-input" value={draft.tips} onChange={(e) => handleFieldChange("tips", e.target.value)} placeholder="เช่น ระวังหลังงอเกร็งหน้าท้อง" />
                    </div>
                  </div>
                </div>

                {/* Block 2: Muscles & Media */}
                <div>
                  <h3 className="ex-block-title">กล้ามเนื้อ & สื่อประกอบ</h3>
                  <div className="ex-form-grid full">

                    <div className="ex-input-group">
                      <label className="ex-label">กล้ามเนื้อที่มีส่วนร่วม (เลือกได้หลายส่วน)</label>
                      <div className="ex-muscle-checks">
                        {muscleOptions.filter(m => m.value !== 'all').map(opt => (
                          <label key={opt.value} className="ex-check-chip">
                            <input
                              type="checkbox"
                              checked={(draft.muscles || []).includes(opt.value)}
                              onChange={(e) => handleCheckbox(opt.value, e.target.checked)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="ex-input-group" style={{ marginTop: '0.5rem' }}>
                      <label className="ex-label">วิดีโอสาธิต (ลิงก์ หรือ อัปโหลด)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="ex-input" style={{ flex: 1 }} value={draft.video || ''} onChange={(e) => handleFieldChange("video", e.target.value)} placeholder="URL วิดีโอ หรืออัปโหลดทางขวา" />
                        <label className="ex-btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                          <PlaySquare size={16} /> {uploadingVideo ? "Uploading..." : "อัปโหลด"}
                          <input type="file" style={{ display: 'none' }} accept="video/*" onChange={onPickVideo} disabled={uploadingVideo} />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Actions */}
                <div className="ex-modal-footer">
                  {draft.id && !draft.id.startsWith("draft-") && (
                    <button className="ex-btn-danger" style={{ marginRight: 'auto' }} onClick={handleDelete}>
                      <Trash2 size={16} /> ลบท่าออกกำลังกาย
                    </button>
                  )}
                  <button className="ex-btn-secondary" onClick={closeModal}>ยกเลิก</button>
                  <button className="ex-btn-save" onClick={handleSave}><Save size={16} /> บันทึกการเปลี่ยนแปลง</button>
                </div>

              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

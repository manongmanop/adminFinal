import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Badge, Card } from "../components/ui.jsx";
import {
  Plus,
  Search,
  Activity,
  Calendar,
  Target,
  Flame,
  Trash2,
  Edit2,
  Save,
  Upload,
  Dumbbell,
  Layers,
  CheckCircle2,
  Clock,
  Users
} from "lucide-react";
import "../css/Programs.css";
import useToasts from "../hooks/useToasts.js";
import Exercise from '../components/Exercise.jsx';
import { fetchPrograms, fetchExercises, createProgram, updateProgram, deleteProgram } from "../api/client.js";

const createEmptyProgram = () => ({
  id: `program-${Date.now()}`,
  name: "โปรแกรมใหม่",
  description: "อธิบายโปรแกรมฟิตเนส",
  duration: "",
  caloriesBurned: 0,
  image: "",
  category: "",
  workoutList: [],
});

const emptyWorkoutForm = () => ({
  id: null,
  name: "",
  description: "",
  musclesText: "",
  muscles: [],
  type: "reps",
  value: "",
  duration: "",
  image: "",
  video: "",
});

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [programForm, setProgramForm] = useState(null);
  const [programErrors, setProgramErrors] = useState({});
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm());
  const [workoutErrors, setWorkoutErrors] = useState({});
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toasts, pushToast, dismissToast } = useToasts();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState(new Set());
  const [dragIndex, setDragIndex] = useState(null);

  // Normalize image URLs: if it's a bare filename, serve from /uploads
  function resolveImageUrl(src) {
    if (!src) return '';
    if (typeof src !== 'string') return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
    return `/uploads/${src}`;
  }

  function handleReorderWorkouts(fromIndex, toIndex) {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    if (!programForm) return;
    const list = [...(programForm.workoutList || [])];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const updated = { ...programForm, workoutList: list };
    setProgramForm(updated);
    setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Persist order immediately
    const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
    (async () => {
      try {
        setLoading(true);
        const saved = isObjectId(updated.id)
          ? await updateProgram(updated.id, updated)
          : await createProgram(updated);
        setProgramForm(saved);
        setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        setSelectedProgramId(saved.id);
        pushToast({ type: 'success', title: 'อัปเดตลำดับสำเร็จ' });
      } catch (e) {
        console.error(e);
        pushToast({ type: 'error', title: 'อัปเดตลำดับไม่สำเร็จ' });
      } finally {
        setLoading(false);
      }
    })();
  }
  // Toasts handled by useToasts hook
  async function openExercisePicker() {
    try {
      setPickerOpen(true);
      if (!allExercises.length) {
        const data = await fetchExercises();
        setAllExercises(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      pushToast({ type: 'error', title: 'โหลดท่าออกกำลังกายไม่สำเร็จ' });
    }
  }

  function toggleSelectExercise(id) {
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function addSelectedExercisesToProgram() {
    if (!selectedExerciseIds.size) {
      setPickerOpen(false);
      return;
    }
    let targetProgram = programForm;
    if (!targetProgram) {
      targetProgram = createEmptyProgram();
      targetProgram.workoutList = [];
      setProgramForm(targetProgram);
      setSelectedProgramId(targetProgram.id);
      setPrograms((prev) => [targetProgram, ...prev]);
    }

    const byId = new Map((targetProgram.workoutList || []).map((w) => [w.exerciseId || w.id, true]));
    const toAdd = allExercises
      .filter((ex) => selectedExerciseIds.has(ex.id) && !byId.has(ex.id))
      .map((ex) => ({
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        exercise: ex.id,
        name: ex.name,
        description: ex.description,
        muscles: ex.muscles || [],
        type: ex.type === 'time' ? 'time' : 'reps',
        value: ex.type === 'reps' ? (ex.value ?? "") : "",
        duration: ex.type === 'time' ? (ex.duration ?? "") : "",
        image: ex.image,
        video: ex.video,
      }));

    const candidate = { ...targetProgram, workoutList: [...(targetProgram.workoutList || []), ...toAdd] };

    try {
      setLoading(true);
      const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
      let saved;
      if (!isObjectId(candidate.id)) {
        saved = await createProgram(candidate);
      } else {
        saved = await updateProgram(candidate.id, candidate);
      }

      // Sync UI with saved program
      setProgramForm(saved);
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== candidate.id)];
      });
      setSelectedProgramId(saved.id);

      const addedCount = toAdd.length;
      pushToast({ type: 'success', title: 'เพิ่มท่าออกกำลังกาย', message: `บันทึก ${addedCount} รายการสำเร็จ` });
    } catch (e) {
      console.error(e);
      pushToast({ type: 'error', title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกท่าได้' });
    } finally {
      setSelectedExerciseIds(new Set());
      setExerciseQuery("");
      setPickerOpen(false);
      setLoading(false);
    }
  }

  // ---- API-backed CRUD helpers ----
  const looksLikeObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

  async function saveProgram() {
    if (!programForm) return;
    const errors = {};
    if (!programForm.name || programForm.name.trim() === "") {
      errors.name = "โปรดใส่ชื่อโปรแกรม";
    }
    if (Object.keys(errors).length) {
      setProgramErrors(errors);
      return;
    }
    try {
      setLoading(true);
      let saved;
      if (!looksLikeObjectId(programForm.id)) {
        saved = await createProgram(programForm);
      } else {
        saved = await updateProgram(programForm.id, programForm);
      }
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== programForm.id)];
      });
      setSelectedProgramId(saved.id);
      setProgramForm(saved);
      setProgramErrors({});
      pushToast({ type: 'success', title: 'บันทึกสำเร็จ', message: 'บันทึกโปรแกรมเรียบร้อยแล้ว' });
    } catch (e) {
      console.error(e);
      setProgramErrors({ general: 'ไม่สามารถบันทึกโปรแกรมได้' });
      pushToast({ type: 'error', title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกโปรแกรมได้' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProgramApi(id) {
    try {
      if (looksLikeObjectId(id)) {
        await deleteProgram(id);
      }
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      if (selectedProgramId === id) {
        setSelectedProgramId(null);
        setProgramForm(null);
      }
      pushToast({ type: 'success', title: 'ลบสำเร็จ', message: 'ลบโปรแกรมเรียบร้อยแล้ว' });
    } catch (e) {
      console.error(e);
      setError('ไม่สามารถลบโปรแกรมได้');
      pushToast({ type: 'error', title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลบโปรแกรมได้' });
    }
  }

  async function saveWorkout() {
    const errors = {};
    if (!workoutForm.name || workoutForm.name.trim() === "") {
      errors.name = "โปรดใส่ชื่อท่าออกกำลังกาย (workout)";
    }
    if (workoutForm.type === "reps") {
      if (!workoutForm.value) errors.value = "โปรดระบุจำนวนครั้ง (reps)";
    } else {
      if (!workoutForm.duration) errors.duration = "โปรดระบุระยะเวลา (วินาที)";
    }
    if (Object.keys(errors).length) {
      setWorkoutErrors(errors);
      return;
    }

    const muscles = (workoutForm.musclesText || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const workoutToSave = {
      ...workoutForm,
      id: workoutForm.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      muscles,
    };

    let updatedProgram = programForm ? { ...programForm } : null;
    if (!updatedProgram) {
      const newProgram = createEmptyProgram();
      newProgram.workoutList = [workoutToSave];
      updatedProgram = newProgram;
    } else {
      const existingIndex = (updatedProgram.workoutList || []).findIndex((w) => w.id === workoutToSave.id);
      if (existingIndex > -1) {
        updatedProgram.workoutList = updatedProgram.workoutList.map((w) => (w.id === workoutToSave.id ? workoutToSave : w));
      } else {
        updatedProgram.workoutList = [...(updatedProgram.workoutList || []), workoutToSave];
      }
    }

    try {
      setLoading(true);
      let saved;
      if (!looksLikeObjectId(updatedProgram.id)) {
        saved = await createProgram(updatedProgram);
      } else {
        saved = await updateProgram(updatedProgram.id, updatedProgram);
      }
      setProgramForm(saved);
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== updatedProgram.id)];
      });
      setSelectedProgramId(saved.id);
      setEditingWorkoutId(null);
      setWorkoutForm(emptyWorkoutForm());
      setWorkoutErrors({});
      pushToast({ type: 'success', title: 'บันทึกท่าสำเร็จ', message: 'บันทึกท่าออกกำลังกายเรียบร้อยแล้ว' });
    } catch (e) {
      console.error(e);
      setWorkoutErrors({ general: 'ไม่สามารถบันทึกท่าออกกำลังกายได้' });
      pushToast({ type: 'error', title: 'บันทึกไม่สำเร็จ', message: 'เกิดข้อผิดพลาดในการบันทึกท่าออกกำลังกาย' });
    } finally {
      setLoading(false);
    }
  }

  // Simple mode: show only the full programs list (no editor/forms/stats)
  const simpleListOnly = false;

  // Load programs from API (or fallback empty)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchPrograms()
      .then((data) => {
        if (!mounted) return;
        // ensure workoutList and muscles exist
        const normalized = (data || []).map((p) => ({
          ...p,
          workoutList: (p.workoutList || []).map((w) => ({
            ...w,
            muscles: w.muscles || [],
            id: w.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          })),
        }));
        setPrograms(normalized);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError("ไม่สามารถโหลดโปรแกรมได้");
        setPrograms([]);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Derived values
  const averageWorkouts = useMemo(() => {
    if (!programs.length) return 0;
    const total = programs.reduce((acc, p) => acc + (p.workoutList?.length || 0), 0);
    return Math.round(total / programs.length);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return programs;
    return programs.filter((p) => {
      if ((p.name || "").toLowerCase().includes(term)) return true;
      if ((p.description || "").toLowerCase().includes(term)) return true;
      return (p.workoutList || []).some((w) => (w.name || "").toLowerCase().includes(term));
    });
  }, [programs, searchTerm]);

  // FIX: replace any use of the undefined `targetProgram` by deriving the current program here
  const currentProgram = useMemo(
    () => programForm || programs.find((p) => p.id === selectedProgramId) || null,
    [programForm, programs, selectedProgramId]
  );

  // example derived helper previously referencing targetProgram
  const currentProgramExerciseIds = useMemo(() => {
    return new Set((currentProgram?.workoutList || []).map((w) => w.exercise).filter(Boolean));
  }, [currentProgram]);

  useEffect(() => {
    // ensure selection sync when programs change
    if (selectedProgramId) {
      const found = programs.find((p) => p.id === selectedProgramId);
      if (found) {
        setProgramForm(found);
      } else {
        setSelectedProgramId(null);
        setProgramForm(null);
      }
    }
  }, [programs, selectedProgramId]);

  // Handlers
  function handleAddProgram() {
    const newProgram = createEmptyProgram();
    setPrograms((prev) => [newProgram, ...prev]);
    setSelectedProgramId(newProgram.id);
    setProgramForm(newProgram);
  }

  function handleProgramFieldChange(field, value) {
    setProgramForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }

  function handleSaveProgram() {
    if (!programForm) return;
    const errors = {};
    if (!programForm.name || programForm.name.trim() === "") {
      errors.name = "โปรดใส่ชื่อโปรแกรม";
    }
    if (Object.keys(errors).length) {
      setProgramErrors(errors);
      return;
    }
    setPrograms((prev) => {
      const exists = prev.find((p) => p.id === programForm.id);
      if (exists) {
        return prev.map((p) => (p.id === programForm.id ? { ...programForm } : p));
      } else {
        return [programForm, ...prev];
      }
    });
    setProgramErrors({});
    setSelectedProgramId(programForm.id);
  }

  function handleDeleteProgram(id) {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    if (selectedProgramId === id) {
      setSelectedProgramId(null);
      setProgramForm(null);
    }
  }

  function handleEditWorkout(workout) {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({
      ...workout,
      musclesText: (workout.muscles || []).join(", "),
    });
  }

  function handleDeleteWorkout(workoutId) {
    if (!programForm) return;
    const updatedList = (programForm.workoutList || []).filter((w) => w.id !== workoutId);
    const updatedProgram = { ...programForm, workoutList: updatedList };
    setProgramForm(updatedProgram);
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
    if (editingWorkoutId === workoutId) {
      setEditingWorkoutId(null);
      setWorkoutForm(emptyWorkoutForm());
    }
  }

  function handleWorkoutFieldChange(field, value) {
    setWorkoutForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleUpload(type, files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const filename = file.name;
    if (type === "image") {
      setWorkoutForm((prev) => ({ ...prev, image: filename }));
    } else if (type === "video") {
      setWorkoutForm((prev) => ({ ...prev, video: filename }));
    }
  }

  function handleSaveWorkout() {
    const errors = {};
    if (!workoutForm.name || workoutForm.name.trim() === "") {
      errors.name = "โปรดใส่ชื่อท่าออกกำลังกาย";
    }
    // validate either value or duration based on type
    if (workoutForm.type === "reps") {
      if (!workoutForm.value) errors.value = "โปรดระบุจำนวนครั้ง (reps)";
    } else {
      if (!workoutForm.duration) errors.duration = "โปรดระบุระยะเวลา (วินาที)";
    }
    if (Object.keys(errors).length) {
      setWorkoutErrors(errors);
      return;
    }

    // normalize muscles
    const muscles = (workoutForm.musclesText || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const workoutToSave = {
      ...workoutForm,
      id: workoutForm.id || `w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      muscles,
    };

    // update programForm and programs
    let updatedProgram = programForm ? { ...programForm } : null;
    if (!updatedProgram) {
      // if no program selected, create one
      const newProgram = createEmptyProgram();
      newProgram.workoutList = [workoutToSave];
      updatedProgram = newProgram;
    } else {
      const existingIndex = (updatedProgram.workoutList || []).findIndex((w) => w.id === workoutToSave.id);
      if (existingIndex > -1) {
        updatedProgram.workoutList = updatedProgram.workoutList.map((w) => (w.id === workoutToSave.id ? workoutToSave : w));
      } else {
        updatedProgram.workoutList = [...(updatedProgram.workoutList || []), workoutToSave];
      }
    }

    setProgramForm(updatedProgram);
    setPrograms((prev) => {
      const exists = prev.find((p) => p.id === updatedProgram.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p));
      } else {
        return [updatedProgram, ...prev];
      }
    });

    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkoutForm());
    setWorkoutErrors({});
  }

  // Early return for simple list-only view
  if (simpleListOnly) {
    return (
      <div className="programs">
        {loading ? (
          <Card className="programs__loading">
            <div className="loading-spinner"></div>
            <p>กำลังโหลดโปรแกรม...</p>
          </Card>
        ) : error ? (
          <Card className="programs__error">
            <p>{error}</p>
          </Card>
        ) : (
          <div className="programs__content">
            <div className="programs__list">
              <h2 className="programs__list-title">รายการโปรแกรมทั้งหมด</h2>
              {programs.map((program) => (
                <Card key={program.id} className="program-item">
                  <div className="program-item__header">
                    <div className="program-item__info">
                      <h3 className="program-item__name">{program.name}</h3>
                      <p className="program-item__description">{program.description}</p>
                      <div className="program-item__meta">
                        <span className="program-item__meta-item">
                          <Clock size={14} />
                          {program.duration || "-"}
                        </span>
                        <span className="program-item__meta-item">
                          <Flame size={14} />
                          {program.caloriesBurned} kcal
                        </span>
                        <span className="program-item__meta-item">
                          <Target size={14} />
                          {program.category || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="programs">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <h4 className="toast__title">{t.title}</h4>
            <button className="toast__close" onClick={() => dismissToast(t.id)} aria-label="ปิดแจ้งเตือน">×</button>
            {t.message && <p className="toast__message">{t.message}</p>}
          </div>
        ))}
      </div>

      {/* Exercise Picker Modal */}
      {pickerOpen && (
        <div className="modal">
          <div className="modal__overlay" onClick={() => setPickerOpen(false)} />
          <div className="modal__dialog" style={{ maxWidth: '900px', width: '100%' }}>
            <div className="modal__header">
              <h3 className="modal__title">เลือกท่าออกกำลังกาย</h3>
              <button className="modal__close" onClick={() => setPickerOpen(false)}>×</button>
            </div>
            <div className="modal__body">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  className="input"
                  placeholder="ค้นหาชื่อท่าออกกำลังกาย..."
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                />
                <span className="badge badge--gray">ทั้งหมด {allExercises.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {allExercises
                  .filter((ex) => (exerciseQuery ? (ex.name || '').toLowerCase().includes(exerciseQuery.toLowerCase()) : true))
                  .map((ex) => {
                    const selected = selectedExerciseIds.has(ex.id);
                    return (
                      <div key={ex.id} className={`card ${selected ? 'program-item--active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSelectExercise(ex.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                          <h4 style={{ margin: 0 }}>{ex.name}</h4>
                          <input type="checkbox" checked={selected} readOnly />
                        </div>
                        <div style={{ fontSize: '.85rem', color: '#64748b' }}>
                          {ex.type === 'time' ? `เวลา: ${ex.duration ?? '-'}` : `จำนวนครั้ง: ${ex.value ?? '-'}`}
                        </div>
                        {Array.isArray(ex.muscles) && ex.muscles.length > 0 && (
                          <div style={{ marginTop: '.5rem', display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                            {ex.muscles.map((m) => (
                              <span key={m} className="badge badge--blue">{m}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', padding: '0 1.5rem 1.25rem' }}>
              <button className="btn btn--secondary" onClick={() => setPickerOpen(false)}>ยกเลิก</button>
              <button className="btn btn--primary" onClick={addSelectedExercisesToProgram}>เพิ่มที่เลือก</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="programs__header">
        <div className="programs__header-content">
          <div className="programs__header-icon">
            <Dumbbell size={28} />
          </div>
          <div className="programs__header-text">
            <h1 className="programs__title">โปรแกรมออกกำลังกาย</h1>
            <p className="programs__subtitle">
              จัดการโปรแกรม เพิ่ม/แก้ไข/จัดลำดับท่า และค้นหาโปรแกรมที่ต้องการได้ที่นี่
            </p>
          </div>
        </div>
        <Button onClick={handleAddProgram} disabled={loading}>
          <Plus size={16} />
          <span>สร้างโปรแกรม</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="programs__stats">
        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">จำนวนโปรแกรมทั้งหมด</span>
            <div className="stat-card__icon stat-card__icon--emerald">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-card__value">{programs.length}</div>
          <p className="stat-card__description">รวมจำนวนโปรแกรมที่มีอยู่ในระบบ</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">ค่าเฉลี่ยจำนวนท่าต่อโปรแกรม</span>
            <div className="stat-card__icon stat-card__icon--blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-card__value">{averageWorkouts}</div>
          <p className="stat-card__description">คิดจากจำนวนท่าทั้งหมดหารด้วยจำนวนโปรแกรม</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">ผลลัพธ์จากการค้นหา</span>
            <div className="stat-card__icon stat-card__icon--purple">
              <Search size={18} />
            </div>
          </div>
          <div className="stat-card__value">{filteredPrograms.length}</div>
          <p className="stat-card__description">จำนวนโปรแกรมที่ตรงกับคำค้นหา</p>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="programs__search">
        <div className="programs__search-wrapper">
          <label className="programs__search-label" htmlFor="program-search">
            ค้นหาโปรแกรมหรือชื่อท่า
          </label>
          <div className="programs__search-input-wrapper">
            <Search size={18} className="programs__search-icon" />
            <Input
              id="program-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์ชื่อโปรแกรม คำอธิบาย หรือชื่อท่าออกกำลังกาย"
              className="programs__search-input"
              disabled={loading || !!error}
            />
          </div>
          <p className="programs__search-hint">
            เคล็ดลับ: ค้นหาด้วยคำสำคัญ เช่น “หน้าอก”, “คาร์ดิโอ”, “full body” เพื่อกรองรายการอย่างรวดเร็ว
          </p>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="programs__loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดโปรแกรม...</p>
        </Card>
      ) : error ? (
        <Card className="programs__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            ลองใหม่
          </Button>
        </Card>
      ) : (
        <div className="programs__content">
          {/* Program List */}
          <div className="programs__list">
            <h2 className="programs__list-title">รายการโปรแกรม</h2>
            
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className={`program-item ${
                  program.id === selectedProgramId ? "program-item--active" : ""
                }`}
                onClick={() => {
                  setSelectedProgramId(program.id);
                  setProgramForm(program);
                }}
              >
                <div className="program-item__header">
                  <div className="program-item__info">
                    <h3 className="program-item__name">{program.name}</h3>
                    <p className="program-item__description">{program.description}</p>
                    
                    <div className="program-item__meta">
                      <span className="program-item__meta-item">
                        <Clock size={14} />
                        {program.duration || "-"}
                      </span>
                      <span className="program-item__meta-item">
                        <Flame size={14} />
                        {program.caloriesBurned} kcal
                      </span>
                      <span className="program-item__meta-item">
                        <Target size={14} />
                        {program.category || "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="program-item__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('ยืนยันการลบโปรแกรมนี้หรือไม่? (ลบข้อมูลออกจากรายการ)')) { deleteProgramApi(program.id); }
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                {program.workoutList.length > 0 && (
                  <div className="program-item__workouts">
                    {program.workoutList.map((workout) => (
                      <Badge key={workout.id} variant="gray" className="program-item__workout-badge">
                        {workout.name}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {program.workoutList.length === 0 && (
                  <p className="program-item__empty">ยังไม่มีท่าออกกำลังกายในโปรแกรมนี้</p>
                )}
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <Card className="programs__empty">
                <Search size={48} className="programs__empty-icon" />
                <p className="programs__empty-text">ไม่พบโปรแกรมที่ตรงกับคำค้นหา</p>
              </Card>
            )}
          </div>

          {/* Program Details */}
          <div className="programs__details">
            {programForm ? (
              <>
                {/* Program Preview Image */}
                <Card className="program-form" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 160, height: 100, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(() => {
                        const fallbackImage = (programForm.workoutList || []).find(w => w?.image)?.image || '';
                        const raw = programForm.image || fallbackImage || '';
                        const src = resolveImageUrl(raw);
                        return src ? (
                          <img src={src} alt="program preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>ไม่มีรูปตัวอย่าง</span>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="program-image">รูปภาพตัวอย่างโปรแกรม (URL)</label>
                      <Input
                        id="program-image"
                        value={programForm.image || ''}
                        onChange={(e) => handleProgramFieldChange('image', e.target.value)}
                        placeholder="https://example.com/preview.jpg"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem' }}>
                        <label className="btn btn--secondary" style={{ cursor: 'pointer' }}>
                          อัปโหลดรูปภาพ
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              try {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('file', file);
                                const resp = await fetch('/api/upload', { method: 'POST', body: fd });
                                if (!resp.ok) throw new Error('upload failed');
                                const data = await resp.json();
                                const url = data?.url;
                                if (!url) throw new Error('no url');
                                // Set image then persist program immediately
                                const next = { ...programForm, image: url };
                                setProgramForm(next);
                                const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
                                const saved = isObjectId(next.id) ? await updateProgram(next.id, next) : await createProgram(next);
                                setProgramForm(saved);
                                setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
                                setSelectedProgramId(saved.id);
                                pushToast({ type: 'success', title: 'อัปโหลดรูปสำเร็จ' });
                              } catch (err) {
                                console.error(err);
                                pushToast({ type: 'error', title: 'อัปโหลดรูปไม่สำเร็จ' });
                              } finally {
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <span className="badge badge--gray">รองรับ URL และไฟล์อัปโหลด</span>
                      </div>
                    </div>
                  </div>
                </Card>
                {/* Program Form */}
                <Card className="program-form">
                  <div className="program-form__header">
                    <h2 className="program-form__title">ข้อมูลโปรแกรม</h2>
                    <Button onClick={saveProgram}>
                      <Save size={16} />
                      <span>บันทึกโปรแกรม</span>
                    </Button>
                    <Button onClick={openExercisePicker}>
                      เลือกท่าออกกำลังกาย
                    </Button>
                  </div>

                  <div className="program-form__body">
                    <div className="form-group">
                      <label className="form-label" htmlFor="program-name">
                        ชื่อโปรแกรม
                      </label>
                      <Input
                        id="program-name"
                        value={programForm.name}
                        onChange={(e) => handleProgramFieldChange("name", e.target.value)}
                        placeholder="เช่น Full Body Workout"
                      />
                      {programErrors.name && (
                        <p className="form-error">{programErrors.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="program-description">
                        คำอธิบายโปรแกรม (ไม่บังคับ)
                      </label>
                      <Textarea
                        id="program-description"
                        rows={4}
                        value={programForm.description}
                        onChange={(e) => handleProgramFieldChange("description", e.target.value)}
                        placeholder="รายละเอียดโปรแกรม จุดประสงค์ อุปกรณ์ที่ใช้ หรือหมายเหตุอื่น ๆ"
                      />
                      {programErrors.description && (
                        <p className="form-error">{programErrors.description}</p>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="program-duration">
                          ระยะเวลาโดยรวม
                        </label>
                        <Input
                          id="program-duration"
                          value={programForm.duration}
                          onChange={(e) => handleProgramFieldChange("duration", e.target.value)}
                          placeholder="เช่น 10:00"
                        />
                        {programErrors.duration && (
                          <p className="form-error">{programErrors.duration}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="program-calories">
                          แคลอรีโดยประมาณ (kcal)
                        </label>
                        <Input
                          id="program-calories"
                          type="number"
                          value={programForm.caloriesBurned}
                          onChange={(e) => handleProgramFieldChange("caloriesBurned", e.target.value)}
                          placeholder="เช่น 200"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="program-category">
                        หมวดหมู่/ประเภท
                      </label>
                      <Input
                        id="program-category"
                        value={programForm.category}
                        onChange={(e) => handleProgramFieldChange("category", e.target.value)}
                        placeholder="เช่น Cardio, Strength"
                      />
                      {programErrors.category && (
                        <p className="form-error">{programErrors.category}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Workout List */}
                <Card className="workout-list">
                  <div className="workout-list__header">
                    <div>
                      <h2 className="workout-list__title">ท่าที่อยู่ในโปรแกรม</h2>
                      <p className="workout-list__subtitle">
                        ลากการ์ดเพื่อจัดลำดับท่า หรือแก้ไขรายละเอียดของแต่ละท่า
                      </p>
                    </div>
                    <Button 
                      onClick={() => setWorkoutForm(emptyWorkoutForm())} 
                      variant="secondary"
                    >
                      ล้างฟอร์ม
                    </Button>
                  </div>

                  <div className="workout-list__grid">
                    {programForm.workoutList.map((workout, idx) => (
                      <Card
                        key={workout.id}
                        className="workout-card"
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleReorderWorkouts(dragIndex, idx)}
                      >
                        <div className="workout-card__header">
                          <div className="workout-card__info">
                            <h3 className="workout-card__name">{workout.name}</h3>
                            <p className="workout-card__description">
                              {workout.description}
                            </p>
                            
                            {(workout.muscles || []).length > 0 && (
                              <div className="workout-card__muscles">
                                {workout.muscles.map((muscle) => (
                                  <span key={muscle} className="workout-card__muscle">
                                    #{muscle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="workout-card__actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditWorkout(workout)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="workout-card__delete"
                              onClick={() => handleDeleteWorkout(workout.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="workout-card__footer">
                          <Badge variant={workout.type === "reps" ? "success" : "blue"}>
                            {workout.type === "reps"
                              ? `${workout.value} ครั้ง`
                              : `${workout.duration} วินาที`}
                          </Badge>
                        </div>
                      </Card>
                    ))}

                    {programForm.workoutList.length === 0 && (
                      <Card className="workout-list__empty">
                        <Layers size={48} className="workout-list__empty-icon" />
                        <p className="workout-list__empty-text">
                          ยังไม่มีท่าในโปรแกรมนี้ — กด “เลือกท่าออกกำลังกาย” หรือเพิ่มจากฟอร์มด้านล่าง
                        </p>
                      </Card>
                    )}
                  </div>
                </Card>

                                <Exercise
                  form={workoutForm}
                  errors={workoutErrors}
                  editing={!!editingWorkoutId}
                  onChange={handleWorkoutFieldChange}
                  onUpload={handleUpload}
                  onCancel={() => { setWorkoutForm(emptyWorkoutForm()); setEditingWorkoutId(null); }}
                  onSave={saveWorkout}
                />
              </>
            ) : (
              <Card className="programs__no-selection">
                <Dumbbell size={64} className="programs__no-selection-icon" />
                <p className="programs__no-selection-text">
                  เลือกโปรแกรมทางซ้ายเพื่อเริ่มแก้ไข
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



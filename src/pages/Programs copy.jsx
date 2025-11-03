import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Badge, Card } from "../components/ui.jsx";
import {
  Plus,
  Search,
  Activity,
  Target,
  Flame,
  Trash2,
  Edit2,
  Save,
  Dumbbell,
  Layers,
  Clock,
} from "lucide-react";
import "../css/Programs.css";
import {
  fetchPrograms,
  fetchExercises,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../api/client.js";

import { createPortal } from "react-dom";


// moved to utils
  if (!newProgramForm.name?.trim()) {
    errs.name = "โปรดกรอกชื่อโปรแกรม";
  }
  if (!isValidDuration(newProgramForm.duration)) {
    errs.duration = "รูปแบบเวลาไม่ถูกต้อง (เช่น 10:00 หรือ 01:05:30)";
  }

  const cal = Number(onlyDigits(newProgramForm.caloriesBurned));
  if (!Number.isFinite(cal) || cal < 0) {
    errs.calories = "กรุณากรอกตัวเลข 0 ขึ้นไป";
  }

  if (Object.keys(errs).length) {
    setNewProgramErrors(errs);
    return;
  }

  try {
    setLoading(true);
    const payload = {
      ...newProgramForm,
      caloriesBurned: cal,
      // (optional) ทำความสะอาด image ถ้าจำเป็น
    };
    const saved = await createProgram(payload);
    setPrograms(prev => [saved, ...prev]);
    setSelectedProgramId(saved.id);
    setProgramForm(saved);
    setCreateOpen(false);
    pushToast({ type: "success", title: "สร้างโปรแกรมสำเร็จ" });
  } catch (e) {
    pushToast({ type: "error", title: "สร้างโปรแกรมไม่สำเร็จ", message: "กรุณาลองใหม่อีกครั้ง" });
  } finally {
    setLoading(false);
  }
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
    const isObjectId = (id) =>
      typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
    (async () => {
      try {
        setLoading(true);
        const saved = isObjectId(updated.id)
          ? await updateProgram(updated.id, updated)
          : await createProgram(updated);
        setProgramForm(saved);
        setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        setSelectedProgramId(saved.id);
        pushToast({ type: "success", title: "อัปเดตลำดับสำเร็จ" });
      } catch (e) {
        console.error(e);
        pushToast({ type: "error", title: "อัปเดตลำดับไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }

  // คืนอาเรย์ที่ id ไม่ซ้ำกัน ถ้ามีซ้ำจะเก็บตัวท้ายสุด
function uniqById(arr = []) {
  const map = new Map();
  for (const item of arr) {
    // รองรับทั้ง id และ _id (ถ้า API บางที่ส่ง _id มา)
    const key = item?.id ?? item?._id;
    if (key != null) map.set(key, { ...item, id: key });
  }
  return Array.from(map.values());
}

async function uploadImageFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await fetch("/api/upload", { method: "POST", body: fd });
  if (!resp.ok) throw new Error("upload failed");
  const data = await resp.json();
  if (!data?.url) throw new Error("no url returned");
  return data.url; // เช่น "/uploads/xxx.jpg"
}
  // Toast helpers
  function pushToast({ type = "info", title = "", message = "" }) {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast = { id, type, title, message };
    setToasts((prev) => [toast, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }
  const dismissToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  async function openExercisePicker() {
  try {
    // ท่าที่มีอยู่แล้วในโปรแกรมปัจจุบัน
    const preset = new Set(
      (programForm?.workoutList || [])
        .map(w => w.exercise)   // ถ้าเก็บ id ท่าที่ฐานข้อมูลไว้ใน field exercise
        .filter(Boolean)
    );

    setSelectedExerciseIds(preset); // ติ๊กไว้ล่วงหน้า
    setPickerOpen(true);

    if (!allExercises.length) {
      const data = await fetchExercises();
      setAllExercises(Array.isArray(data) ? data : []);
    }
  } catch (e) {
    console.error(e);
    pushToast({ type: "error", title: "โหลดท่าออกกำลังกายไม่สำเร็จ" });
  }
}



  function toggleSelectExercise(id) {
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

    const byId = new Map(
      (targetProgram.workoutList || []).map((w) => [w.exerciseId || w.id, true])
    );
    const toAdd = allExercises
      .filter((ex) => selectedExerciseIds.has(ex.id) && !byId.has(ex.id))
      .map((ex) => ({
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        exercise: ex.id,
        name: ex.name,
        description: ex.description,
        muscles: ex.muscles || [],
        type: ex.type === "time" ? "time" : "reps",
        value: ex.type === "reps" ? ex.value ?? "" : "",
        duration: ex.type === "time" ? ex.duration ?? "" : "",
        image: ex.image,
        video: ex.video,
      }));

    const candidate = {
      ...targetProgram,
      workoutList: [...(targetProgram.workoutList || []), ...toAdd],
    };

    try {
      setLoading(true);
      const isObjectId = (id) =>
        typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
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
      pushToast({
        type: "success",
        title: "เพิ่มท่าสำเร็จ",
        message: `เพิ่มท่าออกกำลังกาย ${addedCount} รายการ และบันทึกแล้ว`,
      });
    } catch (e) {
      console.error(e);
      pushToast({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถเพิ่มและบันทึกท่าได้",
      });
    } finally {
      setSelectedExerciseIds(new Set());
      setExerciseQuery("");
      setPickerOpen(false);
      setLoading(false);
    }
  }

  // ---- API-backed CRUD helpers ----
  const looksLikeObjectId = (id) =>
    typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);

  async function saveProgram() {
    if (!programForm) return;
    const errors = {};
    if (!programForm.name || programForm.name.trim() === "") {
      errors.name = "โปรดกรอกชื่อโปรแกรม";
    }
    if (!isValidDuration(programForm.duration)) {
    errors.duration = "รูปแบบเวลาไม่ถูกต้อง (เช่น 10:00 หรือ 01:05:30)";
  }

  const cal = Number(onlyDigits(programForm.caloriesBurned));
  if (!Number.isFinite(cal) || cal < 0) {
    errors.calories = "กรุณากรอกตัวเลข 0 ขึ้นไป";
  }
    if (Object.keys(errors).length) {
      setProgramErrors(errors);
      return;
    }
    const payload = {
    ...programForm,
    caloriesBurned: cal,
  };
    try {
      setLoading(true);
      const saved = !looksLikeObjectId(programForm.id)
      ? await createProgram(payload)
      : await updateProgram(programForm.id, payload);
      // if (!looksLikeObjectId(programForm.id)) {
      //   saved = await createProgram(programForm);
      // } else {
      //   saved = await updateProgram(programForm.id, programForm);
      // }
      setPrograms((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev.filter((p) => p.id !== programForm.id)];
      });
      setSelectedProgramId(saved.id);
      setProgramForm(saved);
      setProgramErrors({});
      pushToast({
        type: "success",
        title: "บันทึกสำเร็จ",
        message: "บันทึกโปรแกรมเรียบร้อยแล้ว",
      });
    } catch (e) {
      console.error(e);
      setProgramErrors({ general: "บันทึกโปรแกรมไม่สำเร็จ" });
      pushToast({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถบันทึกโปรแกรมได้",
      });
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
      pushToast({
        type: "success",
        title: "ลบสำเร็จ",
        message: "ลบโปรแกรมเรียบร้อยแล้ว",
      });
    } catch (e) {
      console.error(e);
      setError("ลบโปรแกรมไม่สำเร็จ");
      pushToast({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถลบโปรแกรมได้",
      });
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
            id:
              w.id ||
              `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          })),
        }));
        setPrograms(normalized);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError("ไม่สามารถดึงข้อมูลโปรแกรมได้");
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
    const total = programs.reduce(
      (acc, p) => acc + (p.workoutList?.length || 0),
      0
    );
    return Math.round(total / programs.length);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return programs;
    return programs.filter((p) => {
      if ((p.name || "").toLowerCase().includes(term)) return true;
      if ((p.description || "").toLowerCase().includes(term)) return true;
      return (p.workoutList || []).some((w) =>
        (w.name || "").toLowerCase().includes(term)
      );
    });
  }, [programs, searchTerm]);

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
function isValidDuration(value) {
  if (value == null || value === "") return true;          // เว้นว่างได้
  const s = String(value).trim();
  if (!/^[0-9:]+$/.test(s)) return false;                  // อนุญาตเฉพาะตัวเลขกับ :

  const parts = s.split(":");
  if (parts.length === 1) {                                // ตัวเลขล้วน = นาที
    return /^\d+$/.test(parts[0]);
  }
  if (parts.length === 2 || parts.length === 3) {          // MM:SS หรือ HH:MM:SS
    if (!parts.every(p => /^\d+$/.test(p) && p.length > 0)) return false;
    const mm = parseInt(parts[parts.length - 2], 10);
    const ss = parseInt(parts[parts.length - 1], 10);
    if (mm >= 60 || ss >= 60) return false;                // นาที/วินาทีต้อง < 60
    return true;
  }
  return false;
}


function onlyDigits(str) {
  return (str || "").replace(/[^\d]/g, "");                // กรองทุกอย่างให้เหลือเฉพาะตัวเลข
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
    const updatedList = (programForm.workoutList || []).filter(
      (w) => w.id !== workoutId
    );
    const updatedProgram = { ...programForm, workoutList: updatedList };
    setProgramForm(updatedProgram);
    setPrograms((prev) =>
      prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p))
    );
    if (editingWorkoutId === workoutId) {
      setEditingWorkoutId(null);
      setWorkoutForm(emptyWorkoutForm());
    }
  }

  function ConfirmCard({
    title = "ยืนยันการลบ",
    message,
    onConfirm,
    onCancel,
  }) {
    return (
      <div className="confirm-layer">
        <div className="confirm-backdrop" onClick={onCancel} />
        <Card className="confirm-card">
          <div className="confirm-card__header">
            <h3 className="confirm-card__title">{title}</h3>
            <button
              className="confirm-card__close"
              onClick={onCancel}
              aria-label="ปิด"
            >
              ×
            </button>
          </div>
          {message && <p className="confirm-card__message">{message}</p>}
          <div className="confirm-card__actions">
            <Button variant="secondary" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              ลบ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Early return for simple list-only view
  if (simpleListOnly) {
    return (
      <div className="programs">
        {loading ? (
          <Card className="programs__loading">
            <div className="loading-spinner"></div>
            <p>Loading programs...</p>
          </Card>
        ) : error ? (
          <Card className="programs__error">
            <p>{error}</p>
          </Card>
        ) : (
          <div className="programs__content">
            <div className="programs__list">
              <h2 className="programs__list-title">All Programs</h2>
              {programs.map((program) => (
                <Card key={program.id} className="program-item">
                  <div className="program-item__header">
                    <div className="program-item__info">
                      <h3 className="program-item__name">{program.name}</h3>
                      <p className="program-item__description">
                        {program.description}
                      </p>
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
            <button
              className="toast__close"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
            {t.message && <p className="toast__message">{t.message}</p>}
          </div>
        ))}
      </div>

      {/* Exercise Picker Modal */}
      {pickerOpen && (
        <div className="modal">
          <div
            className="modal__overlay"
            onClick={() => setPickerOpen(false)}
          />
          <div
            className="modal__dialog"
            style={{ maxWidth: "900px", width: "100%" }}
          >
            <div className="modal__header">
              <h3 className="modal__title">เลือกท่าออกกำลังกายจากฐานข้อมูล</h3>
              <button
                className="modal__close"
                onClick={() => setPickerOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__body">
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  className="input"
                  placeholder="ค้นหาตามชื่อท่า..."
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                />
                <span className="badge badge--gray">
                  ทั้งหมด {allExercises.length}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "12px",
                }}
              >
                {allExercises
  .filter((ex) =>
    exerciseQuery
      ? (ex.name || "").toLowerCase().includes(exerciseQuery.toLowerCase())
      : true
  )
  .map((ex) => {
    const checked = selectedExerciseIds.has(ex.id); // ถูกเลือก (รวมถึงท่าที่มีอยู่แล้ว)
    return (
      <div
        key={ex.id}
        className={`exercise-card ${checked ? "exercise-card--selected" : ""}`}
        onClick={() => toggleSelectExercise(ex.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleSelectExercise(ex.id)}
      >
        {/* checkbox มุมขวา (อ่านอย่างเดียว ให้คลิกที่ card) */}
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="exercise-card__check"
          aria-label={checked ? "เลือกแล้ว" : "ยังไม่เลือก"}
        />

        <h4 className="exercise-card__title">{ex.name}</h4>
        <div className="exercise-card__meta">
          {ex.type === "time" ? `เวลา: ${ex.duration ?? "-"}` : `ครั้ง: ${ex.value ?? "-"}`}
        </div>

        {Array.isArray(ex.muscles) && ex.muscles.length > 0 && (
          <div className="exercise-card__tags">
            {ex.muscles.map((m) => (
              <span key={m} className="badge badge--blue">#{m}</span>
            ))}
          </div>
        )}
      </div>
    );
  })}


              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: ".5rem",
                padding: "0 1.5rem 1.25rem",
              }}
            >
              <button
                className="btn btn--secondary"
                onClick={() => setPickerOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn--primary"
                onClick={addSelectedExercisesToProgram}
              >
                บันทึกการเลือก
              </button>
            </div>
          </div>
        </div>
      )}
      {createOpen && (
  <div className="modal">
    <div className="modal__overlay" onClick={closeCreateModal} />
    <div className="modal__dialog" style={{ maxWidth: 720, width: "100%" }}>
      <div className="modal__header">
        <h3 className="modal__title">สร้างโปรแกรมใหม่</h3>
        <button className="modal__close" onClick={closeCreateModal}>×</button>
      </div>

      <div className="modal__body">
        {/* Preview รูป */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{
            width: 160, height: 100, borderRadius: 12, overflow: "hidden",
            background: "#f1f5f9", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {newProgramForm.image ? (
              <img
                src={resolveImageUrl(newProgramForm.image)}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <span style={{ color: "#94a3b8", fontSize: 12 }}>ไม่มีภาพตัวอย่าง</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
<label className="form-label" htmlFor="new-image-file">อัปโหลดรูปภาพโปรแกรม</label>            
<Input
              id="new-image-file"
              type="file"
              accept="image/*"
             onChange={async (e) => {
     const file = e.target.files?.[0];
     if (!file) return;
     try {
       setUploading(true);
       const url = await uploadImageFile(file);
       setNewProgramForm((p) => ({ ...p, image: url }));
     } catch (err) {
       console.error(err);
       pushToast({ type: "error", title: "อัปโหลดรูปไม่สำเร็จ" });
     } finally {
       setUploading(false);
       e.target.value = "";
     }
   }}
 />
 {uploading && <small className="muted">กำลังอัปโหลด…</small>}
          </div>
        </div>

        {/* ฟอร์มหลัก */}
        <div className="form-group">
          <label className="form-label" htmlFor="new-name">ชื่อโปรแกรม</label>
          <Input
            id="new-name"
            value={newProgramForm.name}
            onChange={(e) => setNewProgramForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="เช่น Full Body Workout"
          />
          {newProgramErrors.name && <p className="form-error">{newProgramErrors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-desc">รายละเอียด (คำอธิบาย)</label>
          <Textarea
            id="new-desc"
            rows={4}
            value={newProgramForm.description}
            onChange={(e) => setNewProgramForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="อธิบายเป้าหมายและลักษณะของโปรแกรม"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="new-duration">ระยะเวลาโปรแกรม</label>
           <Input
  id="new-duration"
  value={newProgramForm.duration}
  onChange={(e) => {
    const raw = e.target.value;
    if (/^[0-9:]*$/.test(raw)) {
      setNewProgramForm(p => ({ ...p, duration: raw }));
      setNewProgramErrors(prev => ({ ...prev, duration: undefined }));
    }
  }}
  onBlur={(e) => {
    const v = e.target.value;
    if (!isValidDuration(v)) {
      setNewProgramErrors(prev => ({
        ...prev,
        duration: "รูปแบบเวลาไม่ถูกต้อง (เช่น 10:00 หรือ 01:05:30)"
      }));
    }
  }}
  placeholder="เช่น 10:00"
/>
{newProgramErrors.duration && (
  <p className="form-error">{newProgramErrors.duration}</p>
)}

          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-cal">พลังงานที่เผาผลาญ (แคลอรี)</label>
            <Input
  id="new-cal"
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={String(newProgramForm.caloriesBurned ?? "")}
  onChange={(e) => {
    const cleaned = onlyDigits(e.target.value);
    setNewProgramForm(p => ({ ...p, caloriesBurned: cleaned }));
    setNewProgramErrors(prev => ({ ...prev, calories: undefined }));
  }}
  onBlur={(e) => {
    const n = Number(onlyDigits(e.target.value));
    if (!Number.isFinite(n) || n < 0) {
      setNewProgramErrors(prev => ({ ...prev, calories: "กรุณากรอกตัวเลข 0 ขึ้นไป" }));
    }
  }}
  placeholder="เช่น 200"
/>
{newProgramErrors.calories && (
  <p className="form-error">{newProgramErrors.calories}</p>
)}

          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-category">หมวดหมู่โปรแกรม</label>
          <Input
            id="new-category"
            value={newProgramForm.category}
            onChange={(e) => setNewProgramForm((p) => ({ ...p, category: e.target.value }))}
            placeholder="เช่น Cardio, Strength"
          />
        </div>

        <div className="programs__search-hint">
          เมื่อบันทึกแล้ว คุณสามารถกด “เลือกจากฐานข้อมูล” เพื่อเพิ่มชุดท่าฝึกเข้าโปรแกรมได้
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem", padding: "0 1.5rem 1.25rem" }}>
        <button className="btn btn--secondary" onClick={closeCreateModal}>ยกเลิก</button>
        <button className="btn btn--primary" onClick={saveNewProgram} disabled={loading}>
          สร้างโปรแกรม
        </button>
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
            <h1 className="programs__title">จัดการโปรแกรมออกกำลังกาย</h1>
            <p className="programs__subtitle">
              สร้าง ปรับแต่ง และจัดการชุดท่าฝึกออกกำลังกายในระบบ
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} disabled={loading}>
          <Plus size={16} />
          <span>เพิ่มโปรแกรมใหม่</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="programs__stats">
        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">โปรแกรมทั้งหมด</span>
            <div className="stat-card__icon stat-card__icon--emerald">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-card__value">{programs.length}</div>
          <p className="stat-card__description">จำนวนโปรแกรมที่อยู่ในระบบ</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">ชุดท่าเฉลี่ย</span>
            <div className="stat-card__icon stat-card__icon--blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-card__value">{averageWorkouts}</div>
          <p className="stat-card__description">
            จำนวนท่าฝึกเฉลี่ยในแต่ละโปรแกรม
          </p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">ผลลัพธ์การค้นหา</span>
            <div className="stat-card__icon stat-card__icon--purple">
              <Search size={18} />
            </div>
          </div>
          <div className="stat-card__value">{filteredPrograms.length}</div>
          <p className="stat-card__description">โปรแกรมที่ตรงกับคำค้นหา</p>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="programs__search">
        <div className="programs__search-wrapper">
          <label className="programs__search-label" htmlFor="program-search">
            ค้นหาโปรแกรมหรือท่าฝึก
          </label>
          <div className="programs__search-input-wrapper">
            <Search size={18} className="programs__search-icon" />
            <Input
              id="program-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อโปรแกรมหรือท่าฝึกภายในโปรแกรม"
              className="programs__search-input"
              disabled={loading || !!error}
            />
          </div>
          <p className="programs__search-hint">
            ระบบจะค้นหาจากชื่อโปรแกรมและชื่อท่าฝึกที่อยู่ในแต่ละชุดโปรแกรมโดยอัตโนมัติ
          </p>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="programs__loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลโปรแกรม...</p>
        </Card>
      ) : error ? (
        <Card className="programs__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
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
                    <p className="program-item__description">
                      {program.description}
                    </p>

                    <div className="program-item__meta">
                      <span className="program-item__meta-item">
                        <Clock size={14} />
                        {program.duration || "-"} นาที
                      </span>
                      <span className="program-item__meta-item">
                        <Flame size={14} />
                        {program.caloriesBurned} แคลอรี
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
                      setConfirmDelete({
                        kind: "program",
                        id: program.id,
                        title: program.name,
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                {program.workoutList.length > 0 && (
                  <div className="program-item__workouts">
                    {program.workoutList.map((workout) => (
                      <Badge
                        key={workout.id}
                        variant="gray"
                        className="program-item__workout-badge"
                      >
                        {workout.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {program.workoutList.length === 0 && (
                  <p className="program-item__empty">ยังไม่มีชุดโปรแกรม</p>
                )}
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <Card className="programs__empty">
                <Search size={48} className="programs__empty-icon" />
                <p className="programs__empty-text">
                  ไม่พบโปรแกรมที่ตรงกับคำค้นหา
                </p>
              </Card>
            )}
          </div>

          {/* Program Details */}
          <div className="programs__details">
            {programForm ? (
              <>
                {/* Program Preview Image */}
                <Card className="program-form" style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 160,
                        height: 100,
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(() => {
                        const fallbackImage =
                          (programForm.workoutList || []).find((w) => w?.image)
                            ?.image || "";
                        const raw = programForm.image || fallbackImage || "";
                        const src = resolveImageUrl(raw);
                        return src ? (
                          <img
                            src={src}
                            alt="program preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>
                            ไม่มีภาพตัวอย่าง
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="program-image">
                        ลิงก์ภาพโปรแกรม (URL)
                      </label>
                      <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
   <label className="btn btn--secondary" style={{ cursor:"pointer" }}>
     อัปโหลดรูปภาพ
     <input
       type="file"
       accept="image/*"
      style={{ display:"none" }}
       onChange={async (e) => {
         const file = e.target.files?.[0];
         if (!file) return;
         try {
             setUploading(true);
           const url = await uploadImageFile(file);
           const next = { ...programForm, image: url };
          setProgramForm(next);
           // บันทึกเข้า DB ทันที
           const isObjectId = (id) => typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
           const saved = isObjectId(next.id)
             ? await updateProgram(next.id, next)
             : await createProgram(next);
           setProgramForm(saved);
           setPrograms((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
           setSelectedProgramId(saved.id);
           pushToast({ type: "success", title: "อัปโหลดรูปสำเร็จ" });
         } catch (err) {
           console.error(err);
           pushToast({ type: "error", title: "อัปโหลดรูปไม่สำเร็จ" });
         } finally {
           setUploading(false);
           e.target.value = "";
         }
         if (!file.type.startsWith("image/")) {
  pushToast({ type:"error", title:"ไฟล์ไม่ใช่รูปภาพ" });
  return;
}
if (file.size > 5 * 1024 * 1024) {
  pushToast({ type:"error", title:"ไฟล์ใหญ่เกิน 5MB" });
  return;
}

       }}
     />
   </label>
   {uploading && <small className="muted">กำลังอัปโหลด…</small>}
 </div>
                    </div>
                  </div>
                </Card>
                {/* Program Form */}
                <Card className="program-form">
                  <div className="program-form__header">
                    <h2 className="program-form__title">รายละเอียดโปรแกรม</h2>
                    <Button onClick={saveProgram}>
                      <Save size={16} />
                      <span>บันทึกข้อมูล</span>
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
                        onChange={(e) =>
                          handleProgramFieldChange("name", e.target.value)
                        }
                        placeholder="เช่น Full Body Workout"
                      />
                      {programErrors.name && (
                        <p className="form-error">{programErrors.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="program-description"
                      >
                        รายละเอียด (คำอธิบาย)
                      </label>
                      <Textarea
                        id="program-description"
                        rows={4}
                        value={programForm.description}
                        onChange={(e) =>
                          handleProgramFieldChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="อธิบายเป้าหมายและลักษณะของโปรแกรม"
                      />
                      {programErrors.description && (
                        <p className="form-error">
                          {programErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="program-duration"
                        >
                          ระยะเวลาโปรแกรม (นาที)
                        </label>
                        <Input
                          id="program-duration"
                          value={programForm.duration}
                           onChange={(e) => {
    const raw = e.target.value;
    // อนุญาตพิมพ์เฉพาะตัวเลขกับ :
    if (/^[0-9:]*$/.test(raw)) {
      handleProgramFieldChange("duration", raw);
      // ล้าง error ทันทีเมื่ออักขระถูกต้อง
      setProgramErrors(prev => ({ ...prev, duration: undefined }));
    }
  }}
  onBlur={(e) => {
    const v = e.target.value;
    if (!isValidDuration(v)) {
      setProgramErrors(prev => ({
        ...prev,
        duration: "รูปแบบเวลาไม่ถูกต้อง (เช่น 10 หรือ 30)"
      }));
    }
  }}
  placeholder="เช่น 10:00"
/>
                        {programErrors.duration && (
                          <p className="form-error">{programErrors.duration}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="program-calories"
                        >
                          พลังงานที่เผาผลาญ (แคลอรี)
                        </label>
                        <Input
  id="program-calories"
  type="text"
  inputMode="numeric"
  pattern="\d*"
  value={String(programForm.caloriesBurned ?? "")}
  onChange={(e) => {
    // กรองให้เหลือเฉพาะตัวเลข
    const cleaned = onlyDigits(e.target.value);
    handleProgramFieldChange("caloriesBurned", cleaned);
    setProgramErrors(prev => ({ ...prev, calories: undefined }));
  }}
  onBlur={(e) => {
    const n = Number(onlyDigits(e.target.value));
    if (!Number.isFinite(n) || n < 0) {
      setProgramErrors(prev => ({ ...prev, calories: "กรุณากรอกตัวเลข 0 ขึ้นไป" }));
    }
  }}
  placeholder="เช่น 200"
/>
{programErrors.calories && (
  <p className="form-error">{programErrors.calories}</p>
)}

                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="program-category">
                        หมวดหมู่โปรแกรม
                      </label>
                      <Input
                        id="program-category"
                        value={programForm.category}
                        onChange={(e) =>
                          handleProgramFieldChange("category", e.target.value)
                        }
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
                      <h2 className="workout-list__title">
                        ชุดท่าฝึกในโปรแกรม
                      </h2>
                      <p className="workout-list__subtitle">
                        เพิ่มหรือแก้ไขรายละเอียดของแต่ละชุดท่าฝึก
                      </p>
                    </div>
                    <Button
                      onClick={() => setWorkoutForm(emptyWorkoutForm())}
                      variant="secondary"
                    >
                      รีเซ็ตฟอร์ม
                    </Button>
                    <Button onClick={openExercisePicker}>
                      เลือกจากฐานข้อมูล
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
                            <h3 className="workout-card__name">
                              {workout.name}
                            </h3>
                            <p className="workout-card__description">
                              {workout.description}
                            </p>

                            {(workout.muscles || []).length > 0 && (
                              <div className="workout-card__muscles">
                                {workout.muscles.map((muscle) => (
                                  <span
                                    key={muscle}
                                    className="workout-card__muscle"
                                  >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete({
                                  kind: "workout",
                                  id: workout.id,
                                  title: workout.name,
                                });
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="workout-card__footer">
                          <Badge
                            variant={
                              workout.type === "reps" ? "success" : "blue"
                            }
                          >
                            {workout.type === "reps"
                              ? `${workout.value} ครั้ง`
                              : `${workout.duration} วินาที`}
                          </Badge>
                        </div>
                      </Card>
                    ))}

                    {programForm.workoutList.length === 0 && (
                      <Card className="workout-list__empty">
                        <Layers
                          size={48}
                          className="workout-list__empty-icon"
                        />
                        <p className="workout-list__empty-text">
                          ยังไม่มีชุดท่าฝึกสำหรับโปรแกรมนี้
                        </p>
                      </Card>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="programs__no-selection">
                <Dumbbell size={64} className="programs__no-selection-icon" />
                <p className="programs__no-selection-text">
                  เลือกโปรแกรมเพื่อดูรายละเอียด
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
      {confirmDelete && (
  <ConfirmCardPortal>
    <ConfirmCard
      title="ยืนยันการลบ"
      message={
        confirmDelete.kind === "program"
          ? `คุณต้องการลบโปรแกรม “${confirmDelete.title || ""}” ใช่หรือไม่?`
          : `คุณต้องการลบท่าฝึก “${confirmDelete.title || ""}” ใช่หรือไม่?`
      }
      onCancel={() => setConfirmDelete(null)}
      onConfirm={async () => {
        const { kind, id } = confirmDelete;
        setConfirmDelete(null);
        if (kind === "program") {
          await deleteProgramApi(id);
        } else if (kind === "workout") {
          handleDeleteWorkout(id);
        }
      }}
    />
  </ConfirmCardPortal>
)}

    </div>
  );
}





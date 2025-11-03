import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Input, Textarea, Badge } from "../components/ui.jsx";
import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Target,
  Layers,
  Edit2,
  Trash2,
  Save,
  XCircle,
  CheckCircle,
} from "lucide-react";
import "../css/Exercises.css";
import { fetchExercises, createExercise, updateExercise, deleteExercise } from "../api/client.js";
import { exercisesData } from "../data/fitnessData.js";

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
  id: `ex-${Date.now()}`,
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

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form & modal states
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [draft, setDraft] = useState(emptyExercise());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // notification card box
  const [notice, setNotice] = useState({
    open: false,
    type: "success", // success | error
    title: "",
    message: "",
  });

  // ===== Load =====
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExercises()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.map((exercise) => ({
              ...exercise,
              muscles: Array.isArray(exercise.muscles) ? exercise.muscles : [],
            }))
          : [];
        const final = normalized.length > 0 ? normalized : exercisesData;
        setExercises(final);
        setSelectedExerciseId((prev) => prev ?? final[0]?.id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("ไม่สามารถดึงข้อมูลท่าฝึก", err);
        setError("ไม่สามารถโหลดข้อมูลท่าฝึกได้ กรุณาลองใหม่อีกครั้ง");
        setExercises([]);
        setSelectedExerciseId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredExercises = useMemo(() => {
    const term = query.toLowerCase();
    return exercises.filter((exercise) => {
      const name = (exercise.name || "").toLowerCase();
      const desc = (exercise.description || "").toLowerCase();
      const muscles = Array.isArray(exercise.muscles) ? exercise.muscles : [];
      const matchesQuery =
        name.includes(term) || desc.includes(term) || muscles.some((m) => m.toLowerCase().includes(term));
      const matchesMuscle =
        muscleFilter === "all" || muscles.map((m) => m.toLowerCase()).includes(muscleFilter.toLowerCase());
      const matchesType = typeFilter === "all" || exercise.type === typeFilter;
      return matchesQuery && matchesMuscle && matchesType;
    });
  }, [exercises, muscleFilter, query, typeFilter]);

  const muscleLookup = useMemo(() => {
    return muscleOptions.reduce((acc, option) => {
      if (option.value !== "all") acc[option.value] = option.label;
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    if (filteredExercises.length === 0) {
      setSelectedExerciseId(null);
      return;
    }
    if (!filteredExercises.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(filteredExercises[0].id);
    }
  }, [filteredExercises, selectedExerciseId]);

  const selectedExercise =
    filteredExercises.find((exercise) => exercise.id === selectedExerciseId) ??
    filteredExercises[0] ??
    exercises[0] ??
    null;

  const stats = useMemo(() => {
    const total = filteredExercises.length;
    const totalCalories = filteredExercises.reduce(
      (sum, exercise) => sum + (exercise.caloriesBurned ?? 0),
      0
    );
    const repsCount = filteredExercises.filter((exercise) => exercise.type === "reps").length;
    const timeCount = filteredExercises.filter((exercise) => exercise.type === "time").length;
    return { total, totalCalories, repsCount, timeCount };
  }, [filteredExercises]);

  function resolveImageUrl(src) {
    if (!src) return "";
    let s = typeof src === "string" ? src : String(src);
    if (/^https?:\/\//i.test(s)) return s;
    s = s.replace(/^[.\/]+/, "");
    s = s.replace(/^(?:uploads\/)+/i, "uploads/");
    if (s.toLowerCase().startsWith("uploads/")) s = s.slice("uploads/".length);
    return `/uploads/${s}`;
  }

  // ===== Upload Handlers =====
  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const result = await uploadFile(file);
      setDraft((d) => ({ ...d, image: result.url }));
    } catch (err) {
      setNotice({
        open: true,
        type: "error",
        title: "อัปโหลดรูปไม่สำเร็จ",
        message: err?.message || "โปรดลองใหม่",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo(true);
      const result = await uploadFile(file);
      setDraft((d) => ({ ...d, video: result.url }));
    } catch (err) {
      setNotice({
        open: true,
        type: "error",
        title: "อัปโหลดวิดีโอไม่สำเร็จ",
        message: err?.message || "โปรดลองใหม่",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  // ===== CRUD Handlers =====
  const openCreate = () => {
    setFormMode("create");
    setDraft(emptyExercise());
    setFormOpen(true);
  };

  const openEdit = (ex) => {
    setFormMode("edit");
    setDraft({
      ...ex,
      value: ex.value ?? 10,
      duration: ex.duration ?? 30,
      caloriesBurned: ex.caloriesBurned ?? 0,
      muscles: Array.isArray(ex.muscles) ? ex.muscles : [],
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!draft.name.trim()) {
        return setNotice({
          open: true,
          type: "error",
          title: "กรอกข้อมูลไม่ครบ",
          message: "โปรดระบุชื่อท่าฝึกอย่างน้อย 1 รายการ",
        });
      }

      const payload = draft.type === "reps" ? { ...draft, duration: null } : { ...draft, value: null };

      if (formMode === "create") {
        const created = await createExercise(payload);
        setExercises((prev) => [created, ...prev]);
        setSelectedExerciseId(created.id);
        setNotice({
          open: true,
          type: "success",
          title: "เพิ่มท่าฝึกสำเร็จ",
          message: `เพิ่ม "${created.name}" เข้าคลังท่าฝึกแล้ว`,
        });
      } else {
        const updated = await updateExercise(draft.id, payload);
        setExercises((prev) => prev.map((ex) => (ex.id === updated.id ? updated : ex)));
        setSelectedExerciseId(updated.id);
        setNotice({
          open: true,
          type: "success",
          title: "อัปเดตท่าฝึกสำเร็จ",
          message: `บันทึกการแก้ไข "${updated.name}" เรียบร้อย`,
        });
      }
      setFormOpen(false);
    } catch (e) {
      console.error(e);
      setNotice({
        open: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const requestDelete = () => setConfirmOpen(true);

  const handleDelete = async () => {
    try {
      const targetId = selectedExercise?.id;
      if (!targetId) return setConfirmOpen(false);
      await deleteExercise(targetId);
      setExercises((prev) => prev.filter((ex) => ex.id !== targetId));
      setConfirmOpen(false);

      const next = filteredExercises.find((ex) => ex.id !== targetId);
      setSelectedExerciseId(next?.id ?? null);

      setNotice({
        open: true,
        type: "success",
        title: "ลบท่าฝึกสำเร็จ",
        message: "รายการถูกลบออกจากคลังแล้ว",
      });
    } catch (e) {
      console.error(e);
      setConfirmOpen(false);
      setNotice({
        open: true,
        type: "error",
        title: "ลบไม่สำเร็จ",
        message: "เกิดปัญหาในการลบ กรุณาลองใหม่",
      });
    }
  };

  const closeNotice = () => setNotice((n) => ({ ...n, open: false }));

  // ====== UI ======
  return (
    <div className="exercises">
      {/* Header */}
      <div className="exercises__header">
        <div className="exercises__header-content">
          <div className="exercises__header-icon">
            <Dumbbell size={28} />
          </div>
          <div className="exercises__header-text">
            <h1 className="exercises__title">คลังท่าออกกำลังกาย</h1>
            <p className="exercises__subtitle">ค้นหาและจัดการรายละเอียดของท่าฝึกที่ใช้ในโปรแกรม</p>
          </div>
        </div>
        <Button variant="secondary" disabled={loading} onClick={openCreate}>
          <Plus size={16} />
          <span>เพิ่มท่าฝึกใหม่</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="exercises__stats">
        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">จำนวนท่าฝึก</span>
            <div className="stat-card__icon stat-card__icon--blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-card__value">{stats.total}</div>
          <p className="stat-card__description">ท่าออกกำลังกาย</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="exercises__filters">
        <div className="exercises__filters-grid">
          <div className="filter-group filter-group--search">
            <label className="filter-label" htmlFor="exercise-search">ค้นหาท่าฝึก</label>
            <div className="filter-input-wrapper">
              <Search size={18} className="filter-icon" />
              <Input
                id="exercise-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาจากชื่อท่าฝึก คำอธิบาย หรือกล้ามเนื้อ"
                className="filter-input"
                disabled={loading || !!error}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="exercise-muscle">กล้ามเนื้อเป้าหมาย</label>
            <div className="filter-select-wrapper">
              <Filter size={16} className="filter-icon-left" />
              <select
                id="exercise-muscle"
                value={muscleFilter}
                onChange={(e) => setMuscleFilter(e.target.value)}
                className="filter-select"
                disabled={loading || !!error}
              >
                {muscleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="exercise-type">ประเภทการกำหนด</label>
            <select
              id="exercise-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
              disabled={loading || !!error}
            >
              <option value="all">ทั้งหมด</option>
              <option value="reps">จำนวนครั้ง</option>
              <option value="time">เวลา</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="exercises__loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลท่าฝึก...</p>
        </Card>
      ) : error ? (
        <Card className="exercises__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </Card>
      ) : (
        <div className="exercises__content">
          {/* Exercise List */}
          <div className="exercises__list">
            <h2 className="exercises__list-title">รายการท่าฝึก ({filteredExercises.length})</h2>

            {filteredExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className={`exercise-item ${exercise.id === selectedExercise?.id ? "exercise-item--active" : ""}`}
                onClick={() => setSelectedExerciseId(exercise.id)}
              >
                <div className="exercise-item__header">
                  <div className="exercise-item__icon">
                    <Target size={20} />
                  </div>
                  <div className="exercise-item__info">
                    <h3 className="exercise-item__name">{exercise.name}</h3>
                    <p className="exercise-item__description">{exercise.description}</p>
                  </div>
                  <Badge variant={exercise.type === "reps" ? "success" : "blue"}>
                    {exercise.type === "reps" ? "นับครั้ง" : "นับเวลา"}
                  </Badge>
                </div>

                {exercise.muscles.length > 0 && (
                  <div className="exercise-item__muscles">
                    {exercise.muscles.map((muscleKey) => (
                      <span key={muscleKey} className="exercise-item__muscle">
                        {muscleLookup[muscleKey] || muscleKey}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {filteredExercises.length === 0 && (
              <Card className="exercises__empty">
                <Search size={48} className="exercises__empty-icon" />
                <p className="exercises__empty-text">ไม่พบข้อมูลท่าฝึกตามเงื่อนไขที่เลือก</p>
              </Card>
            )}
          </div>

          {/* Exercise Details */}
          {selectedExercise ? (
            <Card className="exercise-details">
              <div className="exercise-details__header">
                <div>
                  <h2 className="exercise-details__title">รายละเอียดท่าฝึก</h2>
                  <p className="exercise-details__subtitle">จัดการข้อมูลเพื่อให้การฝึกมีประสิทธิภาพสูงสุด</p>
                </div>
                <Badge variant={selectedExercise.type === "reps" ? "success" : "blue"}>
                  {selectedExercise.type === "reps" ? "นับจำนวนครั้ง" : "นับเวลา"}
                </Badge>
              </div>

              <div className="exercise-details__body">
                <div className="detail-row">
                  <div className="detail-group">
                    <label className="detail-label">ชื่อท่าฝึก</label>
                    <Input value={selectedExercise.name} readOnly />
                  </div>
                  <div className="detail-group">
                    <label className="detail-label">พลังงานที่เผาผลาญ</label>
                    <div className="detail-value-box">
                      <Flame size={16} className="detail-icon" />
                      <span>{selectedExercise.caloriesBurned} แคลอรี</span>
                    </div>
                  </div>
                </div>

                <div className="detail-group">
                  <label className="detail-label">รายละเอียด</label>
                  <Textarea value={selectedExercise.description} readOnly rows={3} />
                </div>

                <div className="detail-group">
                  <label className="detail-label">คำแนะนำการปฏิบัติ</label>
                  <Textarea value={selectedExercise.tips} readOnly rows={3} />
                </div>

                <div className="detail-row">
                  {selectedExercise.type === "reps" ? (
                    <div className="detail-group">
                      <label className="detail-label">จำนวนครั้งที่แนะนำ</label>
                      <div className="detail-value-box">
                        <CheckCircle2 size={16} className="detail-icon" />
                        <span>{selectedExercise.value} ครั้ง</span>
                      </div>
                    </div>
                  ) : (
                    <div className="detail-group">
                      <label className="detail-label">ระยะเวลาที่แนะนำ</label>
                      <div className="detail-value-box">
                        <Clock size={16} className="detail-icon" />
                        <span>{selectedExercise.duration} วินาที</span>
                      </div>
                    </div>
                  )}
                  <div className="detail-group">
                    <label className="detail-label">ไฟล์วิดีโอ</label>
                    <Input value={selectedExercise.video} readOnly />
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label className="detail-label">รูปภาพประกอบ</label>
                    <Input value={selectedExercise.image} readOnly />
                    <div className="image-frame">
                      {selectedExercise?.image ? (
                        <img
                          className="image-thumb"
                          src={resolveImageUrl(selectedExercise.image)}
                          alt="exercise preview"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <span className="image-placeholder">ไม่มีภาพตัวอย่าง</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label className="detail-label">กล้ามเนื้อเป้าหมาย</label>
                    <div className="detail-muscles">
                      {selectedExercise.muscles.map((muscleKey) => (
                        <Badge key={muscleKey} variant="gray">
                          {muscleLookup[muscleKey] || muscleKey}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="detail-actions">
                  <Button variant="secondary" onClick={() => openEdit(selectedExercise)}>
                    <Edit2 size={16} />
                    แก้ไข
                  </Button>
                  <Button variant="danger" onClick={requestDelete}>
                    <Trash2 size={16} />
                    ลบท่าฝึก
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="exercises__no-selection">
              <Target size={64} className="exercises__no-selection-icon" />
              <p className="exercises__no-selection-text">เลือกท่าฝึกจากด้านซ้ายเพื่อดูรายละเอียด</p>
            </Card>
          )}
        </div>
      )}

      {/* ===== Modal: Create/Edit Form ===== */}
      {formOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setFormOpen(false)} />
          <div className="modal-card">
            <div className="modal-card__header">
              <h3>{formMode === "create" ? "เพิ่มท่าฝึกใหม่" : "แก้ไขท่าฝึก"}</h3>
            </div>
            <div className="modal-card__body">
              <div className="form-grid">
                <div className="form-group">
                  <label>ชื่อท่าฝึก *</label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="เช่น Squat, Push-up"
                  />
                </div>

                <div className="form-group">
                  <label>ประเภท</label>
                  <select
                    className="filter-select"
                    value={draft.type}
                    onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                  >
                    <option value="reps">นับจำนวนครั้ง</option>
                    <option value="time">นับเวลา</option>
                  </select>
                </div>

                {draft.type === "reps" ? (
                  <div className="form-group">
                    <label>จำนวนครั้งแนะนำ</label>
                    <Input
                      type="number"
                      min={1}
                      value={draft.value ?? 10}
                      onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>เวลาที่แนะนำ (วินาที)</label>
                    <Input
                      type="number"
                      min={5}
                      value={draft.duration ?? 30}
                      onChange={(e) => setDraft((d) => ({ ...d, duration: Number(e.target.value) }))}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>แคลอรีโดยประมาณ</label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.caloriesBurned}
                    onChange={(e) => setDraft((d) => ({ ...d, caloriesBurned: Number(e.target.value) }))}
                    placeholder="เช่น 5"
                  />
                </div>

                <div className="form-group form-col-span-2">
                  <label>รายละเอียด</label>
                  <Textarea
                    rows={3}
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="อธิบายรายละเอียดการทำท่า"
                  />
                </div>

                <div className="form-group form-col-span-2">
                  <label>คำแนะนำ</label>
                  <Textarea
                    rows={3}
                    value={draft.tips}
                    onChange={(e) => setDraft((d) => ({ ...d, tips: e.target.value }))}
                    placeholder="คำแนะนำเพิ่มเติม/ข้อควรระวัง"
                  />
                </div>

                {/* วิดีโอ */}
                <div className="form-group">
                  <label>วิดีโอ (อัปโหลดจากเครื่องหรือใส่ URL)</label>
                  <Input
                    value={draft.video}
                    onChange={(e) => setDraft((d) => ({ ...d, video: e.target.value }))}
                    placeholder="/uploads/videos/pushup.mp4 หรือ https://..."
                  />
                  <div className="upload-row">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={onPickVideo}
                      disabled={uploadingVideo}
                    />
                    {uploadingVideo && <small className="upload-hint">กำลังอัปโหลด...</small>}
                  </div>
                  {draft.video && (
                    <video
                      className="video-preview"
                      src={draft.video}
                      controls
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>

                {/* รูปภาพ */}
                <div className="form-group">
                  <label>รูปภาพ (อัปโหลดจากเครื่องหรือใส่ URL)</label>
                  <Input
                    value={draft.image}
                    onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                    placeholder="/uploads/images/pushup.jpg หรือ https://..."
                  />
                  <div className="upload-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPickImage}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <small className="upload-hint">กำลังอัปโหลด...</small>}
                  </div>
                  {draft.image && (
                    <div className="preview-box">
                      <img
                        className="preview-img"
                        src={draft.image}
                        alt="preview"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group form-col-span-2">
                  <label>กล้ามเนื้อเป้าหมาย</label>
                  <div className="muscle-checkboxes">
                    {muscleOptions
                      .filter((m) => m.value !== "all")
                      .map((m) => {
                        const checked = draft.muscles.includes(m.value);
                        return (
                          <label key={m.value} className="checkbox-chip">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setDraft((d) => {
                                  const set = new Set(d.muscles);
                                  if (e.target.checked) set.add(m.value);
                                  else set.delete(m.value);
                                  return { ...d, muscles: Array.from(set) };
                                });
                              }}
                            />
                            <span>{m.label}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-card__footer">
              <Button onClick={handleSave}>
                <Save size={16} />
                บันทึก
              </Button>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                <XCircle size={16} />
                ยกเลิก
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ===== Confirm Delete ===== */}
      {confirmOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setConfirmOpen(false)} />
          <div className="modal-card modal-card--sm">
            <div className="modal-card__header">
              <h3>ยืนยันการลบ</h3>
            </div>
            <div className="modal-card__body">
              <p>คุณต้องการลบท่าฝึก “{selectedExercise?.name}” ออกจากคลังหรือไม่?</p>
            </div>
            <div className="modal-card__footer">
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 size={16} />
                ลบ
              </Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ===== Center Notice Card Box ===== */}
      {notice.open && (
        <>
          <div className="notice-backdrop" onClick={closeNotice} />
        <div className={`notice-card ${notice.type === "error" ? "notice-card--error" : "notice-card--success"}`}>
            <div className="notice-card__icon">
              {notice.type === "error" ? <XCircle size={28} /> : <CheckCircle size={28} />}
            </div>
            <div className="notice-card__content">
              <h4 className="notice-card__title">{notice.title}</h4>
              <p className="notice-card__message">{notice.message}</p>
            </div>
            <div>
              <Button variant="secondary" onClick={closeNotice}>ปิด</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

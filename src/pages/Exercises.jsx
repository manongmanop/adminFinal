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
  TrendingUp,
  Layers
} from "lucide-react";
import "../css/Exercises.css";
import { fetchExercises } from "../api/client.js";
import { exercisesData } from "../data/fitnessData.js";

const muscleOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "arms", label: "กล้ามแขน" },
  { value: "biceps", label: "ลูกหนู" },
  { value: "core", label: "แกนกลาง" },
  { value: "back", label: "หลัง" },
  { value: "legs", label: "ต้นขา" },
  { value: "glutes", label: "สะโพก" },
  { value: "hamstrings", label: "หลังขา" },
  { value: "chest", label: "อก" },
  { value: "shoulders", label: "ไหล่" },
];

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (!cancelled) {
          setLoading(false);
        }
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
    const totalCalories = filteredExercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned ?? 0), 0);
    const repsCount = filteredExercises.filter((exercise) => exercise.type === "reps").length;
    const timeCount = filteredExercises.filter((exercise) => exercise.type === "time").length;
    return { total, totalCalories, repsCount, timeCount };
  }, [filteredExercises]);

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
            <p className="exercises__subtitle">
              ค้นหาและจัดการรายละเอียดของท่าฝึกที่ใช้ในโปรแกรม
            </p>
          </div>
        </div>
        <Button variant="secondary" disabled={loading}>
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
          <p className="stat-card__description">ผลลัพธ์ตามการค้นหา</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">แบบจำนวนครั้ง</span>
            <div className="stat-card__icon stat-card__icon--emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-card__value">{stats.repsCount}</div>
          <p className="stat-card__description">ท่าฝึกที่กำหนดด้วยจำนวนครั้ง</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">แบบจับเวลา</span>
            <div className="stat-card__icon stat-card__icon--purple">
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-card__value">{stats.timeCount}</div>
          <p className="stat-card__description">ท่าฝึกที่กำหนดด้วยเวลา</p>
        </Card>

        <Card className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">พลังงานรวม</span>
            <div className="stat-card__icon stat-card__icon--orange">
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-card__value">{stats.totalCalories}</div>
          <p className="stat-card__description">แคลอรีที่เผาผลาญรวม</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="exercises__filters">
        <div className="exercises__filters-grid">
          <div className="filter-group filter-group--search">
            <label className="filter-label" htmlFor="exercise-search">
              ค้นหาท่าฝึก
            </label>
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
            <label className="filter-label" htmlFor="exercise-muscle">
              กล้ามเนื้อเป้าหมาย
            </label>
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
            <label className="filter-label" htmlFor="exercise-type">
              ประเภทการกำหนด
            </label>
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
                className={`exercise-item ${
                  exercise.id === selectedExercise?.id ? "exercise-item--active" : ""
                }`}
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
                    {exercise.type === "reps" ? "ครั้ง" : "เวลา"}
                  </Badge>
                </div>

                {exercise.muscles.length > 0 && (
                  <div className="exercise-item__muscles">
                    {exercise.muscles.map((muscle) => (
                      <span key={muscle} className="exercise-item__muscle">
                        #{muscle}
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
                  <p className="exercise-details__subtitle">
                    จัดการข้อมูลเพื่อให้การฝึกมีประสิทธิภาพสูงสุด
                  </p>
                </div>
                <Badge variant={selectedExercise.type === "reps" ? "success" : "blue"}>
                  {selectedExercise.type === "reps" ? "จำนวนครั้ง" : "เวลา"}
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
                  </div>
                  <div className="detail-group">
                    <label className="detail-label">กล้ามเนื้อเป้าหมาย</label>
                    <div className="detail-muscles">
                      {selectedExercise.muscles.map((muscle) => (
                        <Badge key={muscle} variant="gray">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="exercises__no-selection">
              <Target size={64} className="exercises__no-selection-icon" />
              <p className="exercises__no-selection-text">
                เลือกท่าฝึกจากด้านซ้ายเพื่อดูรายละเอียด
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
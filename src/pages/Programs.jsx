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
} from "lucide-react";

import { fetchPrograms } from "../api/client.js";

const createEmptyProgram = () => ({
  id: `program-${Date.now()}`,
  name: "โปรแกรมใหม่",
  description: "อธิบายรายละเอียดโปรแกรม",
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPrograms()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.map((program) => ({
              ...program,
              workoutList: (program.workoutList ?? []).map((workout) => ({
                ...workout,
                muscles: Array.isArray(workout.muscles) ? [...workout.muscles] : [],
              })),
            }))
          : [];

        setPrograms(normalized);
        setSelectedProgramId(normalized[0]?.id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("ไม่สามารถดึงข้อมูลโปรแกรม", err);
        setError("ไม่สามารถโหลดข้อมูลโปรแกรมได้ กรุณาลองใหม่อีกครั้ง");
        setPrograms([]);
        setSelectedProgramId(null);
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

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return programs.filter((program) => {
      const programMatch = program.name.toLowerCase().includes(term);
      const workoutMatch = program.workoutList.some((workout) =>
        workout.name.toLowerCase().includes(term)
      );
      return programMatch || workoutMatch;
    });
  }, [programs, searchTerm]);

  useEffect(() => {
    if (filteredPrograms.length === 0) {
      setSelectedProgramId(null);
      return;
    }
    if (!filteredPrograms.some((program) => program.id === selectedProgramId)) {
      setSelectedProgramId(filteredPrograms[0].id);
    }
  }, [filteredPrograms, selectedProgramId]);

  useEffect(() => {
    const selected = programs.find((program) => program.id === selectedProgramId);
    if (selected) {
      setProgramForm({
        ...selected,
        workoutList: selected.workoutList.map((workout) => ({
          ...workout,
          muscles: [...(workout.muscles ?? [])],
        })),
      });
    } else {
      setProgramForm(null);
    }
    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkoutForm());
    setWorkoutErrors({});
  }, [selectedProgramId, programs]);

  const handleAddProgram = () => {
    const newProgram = createEmptyProgram();
    setPrograms((prev) => [newProgram, ...prev]);
    setSelectedProgramId(newProgram.id);
  };

  const handleDeleteProgram = (id) => {
    if (!window.confirm("ต้องการลบโปรแกรมนี้หรือไม่?")) return;
    setPrograms((prev) => prev.filter((program) => program.id !== id));
  };

  const handleProgramFieldChange = (field, value) => {
    setProgramForm((prev) => ({
      ...prev,
      [field]: field === "caloriesBurned" ? Number(value) || 0 : value,
    }));
  };

  const validateProgram = () => {
    const errors = {};
    if (!programForm?.name?.trim()) errors.name = "กรุณาระบุชื่อโปรแกรม";
    if (!programForm?.description?.trim()) errors.description = "กรุณาใส่รายละเอียดโปรแกรม";
    if (!programForm?.duration?.trim()) errors.duration = "กำหนดระยะเวลาโปรแกรม";
    if (!programForm?.category?.trim()) errors.category = "ระบุหมวดหมู่ของโปรแกรม";
    return errors;
  };

  const handleSaveProgram = () => {
    if (!programForm) return;
    const errors = validateProgram();
    setProgramErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPrograms((prev) =>
      prev.map((program) =>
        program.id === programForm.id
          ? {
              ...programForm,
              workoutList: programForm.workoutList.map((workout) => ({
                ...workout,
                muscles: workout.muscles ?? [],
              })),
            }
          : program
      )
    );
    alert("บันทึกข้อมูลโปรแกรมเรียบร้อยแล้ว");
  };

  const handleWorkoutFieldChange = (field, value) => {
    setWorkoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateWorkout = () => {
    const errors = {};
    if (!workoutForm.name.trim()) errors.name = "กรุณาระบุชื่อชุดโปรแกรม";
    if (!workoutForm.description.trim()) errors.description = "ใส่คำอธิบายของชุดโปรแกรม";
    if (!workoutForm.musclesText.trim()) errors.muscles = "ระบุกล้ามเนื้อที่ใช้";
    if (workoutForm.type === "reps" && !workoutForm.value) errors.value = "กำหนดจำนวนครั้ง";
    if (workoutForm.type === "time" && !workoutForm.duration) errors.duration = "กำหนดระยะเวลา (วินาที)";
    return errors;
  };

  const handleSaveWorkout = () => {
    if (!programForm) return;
    const errors = validateWorkout();
    setWorkoutErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const muscles = workoutForm.musclesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const workoutPayload = {
      id: editingWorkoutId ?? `workout-${Date.now()}`,
      name: workoutForm.name,
      description: workoutForm.description,
      muscles,
      type: workoutForm.type,
      value: workoutForm.type === "reps" ? Number(workoutForm.value) || 0 : "",
      duration: workoutForm.type === "time" ? Number(workoutForm.duration) || 0 : "",
      image: workoutForm.image,
      video: workoutForm.video,
    };

    setProgramForm((prev) => {
      if (!prev) return prev;
      const nextWorkouts = editingWorkoutId
        ? prev.workoutList.map((item) => (item.id === editingWorkoutId ? workoutPayload : item))
        : [...prev.workoutList, workoutPayload];
      return {
        ...prev,
        workoutList: nextWorkouts,
      };
    });

    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkoutForm());
    setWorkoutErrors({});
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      musclesText: workout.muscles.join(", "),
      type: workout.type,
      value: workout.value || "",
      duration: workout.duration || "",
      image: workout.image || "",
      video: workout.video || "",
    });
  };

  const handleDeleteWorkout = (id) => {
    if (!window.confirm("ต้องการลบชุดโปรแกรมนี้หรือไม่?")) return;
    setProgramForm((prev) => ({
      ...prev,
      workoutList: prev.workoutList.filter((workout) => workout.id !== id),
    }));
  };

  const handleUpload = (field, files) => {
    if (!files || files.length === 0) return;
    const fileName = files[0].name;
    setWorkoutForm((prev) => ({ ...prev, [field]: `/uploads/${fileName}` }));
  };

  const averageWorkouts = programs.length
    ? (
        programs.reduce((sum, program) => sum + program.workoutList.length, 0) /
        programs.length
      ).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Dumbbell size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">จัดการโปรแกรมออกกำลังกาย</h1>
            <p className="text-sm text-gray-400">สร้าง ปรับแต่ง และจัดการชุดท่าฝึกออกกำลังกายในระบบ</p>
          </div>
        </div>
        <Button onClick={handleAddProgram} className="w-full md:w-auto" disabled={loading}>
          <Plus size={16} /> เพิ่มโปรแกรมใหม่
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>โปรแกรมทั้งหมด</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{programs.length}</div>
          <p className="text-xs text-gray-500">จำนวนโปรแกรมที่อยู่ในระบบ</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>ชุดท่าเฉลี่ยต่อโปรแกรม</span>
            <Layers size={16} className="text-sky-400" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{averageWorkouts}</div>
          <p className="text-xs text-gray-500">จำนวนท่าฝึกเฉลี่ยในแต่ละโปรแกรม</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>ผลลัพธ์การค้นหา</span>
            <Search size={16} className="text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{filteredPrograms.length}</div>
          <p className="text-xs text-gray-500">โปรแกรมที่ตรงกับคำค้นหา</p>
        </Card>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-900/60 p-6 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-search">
            ค้นหาโปรแกรมหรือท่าฝึก
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="program-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อโปรแกรมหรือท่าฝึกภายในโปรแกรม"
              className="pl-10"
              disabled={loading || !!error}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            ระบบจะค้นหาจากชื่อโปรแกรมและชื่อท่าฝึกที่อยู่ในแต่ละชุดโปรแกรมโดยอัตโนมัติ
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-gray-400">กำลังโหลดข้อมูลโปรแกรม...</Card>
      ) : error ? (
        <Card className="space-y-4 border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-100">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-4">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className={`cursor-pointer border ${
                  program.id === selectedProgramId ? "border-emerald-500" : "border-gray-700"
                } bg-gray-900/70 p-5 transition hover:border-emerald-400/70`}
                onClick={() => setSelectedProgramId(program.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{program.name}</h3>
                    <p className="text-xs text-gray-400">{program.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {program.duration || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={14} /> {program.caloriesBurned} แคลอรี
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={14} /> {program.category || "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-300 hover:text-rose-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(program.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {program.workoutList.map((workout) => (
                    <Badge key={workout.id} className="bg-gray-800 text-gray-300">
                      {workout.name}
                    </Badge>
                  ))}
                  {program.workoutList.length === 0 && (
                    <span className="text-xs text-gray-500">ยังไม่มีชุดโปรแกรม</span>
                  )}
                </div>
              </Card>
            ))}
            {filteredPrograms.length === 0 && (
              <Card className="p-6 text-center text-gray-400">ไม่พบโปรแกรมที่ตรงกับคำค้นหา</Card>
            )}
          </div>

          <div className="space-y-6">
            {programForm ? (
              <>
                <Card className="border border-gray-700 bg-gray-900/70 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">รายละเอียดโปรแกรม</h2>
                    <Button onClick={handleSaveProgram}>
                      <Save size={16} /> บันทึกข้อมูล
                    </Button>
                  </div>
                  <div className="mt-6 grid gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-name">
                        ชื่อโปรแกรม
                      </label>
                      <Input
                        id="program-name"
                        value={programForm.name}
                        onChange={(e) => handleProgramFieldChange("name", e.target.value)}
                        placeholder="เช่น Full Body Workout"
                      />
                      {programErrors.name && (
                        <p className="mt-1 text-xs text-rose-400">{programErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-description">
                        รายละเอียด (คำอธิบาย)
                      </label>
                      <Textarea
                        id="program-description"
                        rows={4}
                        value={programForm.description}
                        onChange={(e) => handleProgramFieldChange("description", e.target.value)}
                        placeholder="อธิบายเป้าหมายและลักษณะของโปรแกรม"
                      />
                      {programErrors.description && (
                        <p className="mt-1 text-xs text-rose-400">{programErrors.description}</p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-duration">
                          ระยะเวลาโปรแกรม
                        </label>
                        <Input
                          id="program-duration"
                          value={programForm.duration}
                          onChange={(e) => handleProgramFieldChange("duration", e.target.value)}
                          placeholder="เช่น 10:00"
                        />
                        {programErrors.duration && (
                          <p className="mt-1 text-xs text-rose-400">{programErrors.duration}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-calories">
                          พลังงานที่เผาผลาญ (แคลอรี)
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="program-category">
                        หมวดหมู่โปรแกรม
                      </label>
                      <Input
                        id="program-category"
                        value={programForm.category}
                        onChange={(e) => handleProgramFieldChange("category", e.target.value)}
                        placeholder="เช่น Cardio, Strength"
                      />
                      {programErrors.category && (
                        <p className="mt-1 text-xs text-rose-400">{programErrors.category}</p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-700 bg-gray-900/70 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">ชุดท่าฝึกในโปรแกรม</h2>
                      <p className="text-sm text-gray-400">เพิ่มหรือแก้ไขรายละเอียดของแต่ละชุดท่าฝึก</p>
                    </div>
                    <Button onClick={() => setWorkoutForm(emptyWorkoutForm())} variant="secondary">
                      รีเซ็ตฟอร์ม
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {programForm.workoutList.map((workout) => (
                      <Card key={workout.id} className="border border-gray-700 bg-gray-900/70 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                            <p className="text-xs text-gray-400">{workout.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                              {workout.muscles.map((muscle) => (
                                <span key={muscle} className="rounded-full bg-gray-800 px-3 py-1">
                                  #{muscle}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditWorkout(workout)}>
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-300 hover:text-rose-200"
                              onClick={() => handleDeleteWorkout(workout.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <Badge variant={workout.type === "reps" ? "success" : "blue"}>
                            {workout.type === "reps" ? `จำนวนครั้ง ${workout.value}` : `ระยะเวลา ${workout.duration} วินาที`}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                    {programForm.workoutList.length === 0 && (
                      <Card className="p-6 text-center text-gray-400">ยังไม่มีชุดท่าฝึกสำหรับโปรแกรมนี้</Card>
                    )}
                  </div>
                </Card>

                <Card className="border border-gray-700 bg-gray-900/70 p-6">
                  <h2 className="text-xl font-semibold text-white">เพิ่ม / แก้ไขชุดโปรแกรม</h2>
                  <p className="text-sm text-gray-400">กรอกข้อมูลรายละเอียดและกำหนดกล้ามเนื้อที่เกี่ยวข้อง</p>

                  <div className="mt-6 grid gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-name">
                        ชื่อชุดโปรแกรม
                      </label>
                      <Input
                        id="workout-name"
                        value={workoutForm.name}
                        onChange={(e) => handleWorkoutFieldChange("name", e.target.value)}
                        placeholder="เช่น Warm-up Session"
                      />
                      {workoutErrors.name && (
                        <p className="mt-1 text-xs text-rose-400">{workoutErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-description">
                        รายละเอียดชุดโปรแกรม
                      </label>
                      <Textarea
                        id="workout-description"
                        rows={3}
                        value={workoutForm.description}
                        onChange={(e) => handleWorkoutFieldChange("description", e.target.value)}
                        placeholder="อธิบายรายละเอียดและเทคนิคของชุดโปรแกรม"
                      />
                      {workoutErrors.description && (
                        <p className="mt-1 text-xs text-rose-400">{workoutErrors.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-muscles">
                        กล้ามเนื้อที่เกี่ยวข้อง
                      </label>
                      <Input
                        id="workout-muscles"
                        value={workoutForm.musclesText}
                        onChange={(e) => handleWorkoutFieldChange("musclesText", e.target.value)}
                        placeholder="ระบุด้วยเครื่องหมายจุลภาค เช่น chest, arms"
                      />
                      {workoutErrors.muscles && (
                        <p className="mt-1 text-xs text-rose-400">{workoutErrors.muscles}</p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-type">
                          ประเภทการกำหนด
                        </label>
                        <select
                          id="workout-type"
                          value={workoutForm.type}
                          onChange={(e) => handleWorkoutFieldChange("type", e.target.value)}
                          className="w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="reps">จำนวนครั้ง</option>
                          <option value="time">ระยะเวลา</option>
                        </select>
                      </div>

                      {workoutForm.type === "reps" ? (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-value">
                            จำนวนครั้ง
                          </label>
                          <Input
                            id="workout-value"
                            type="number"
                            value={workoutForm.value}
                            onChange={(e) => handleWorkoutFieldChange("value", e.target.value)}
                            placeholder="เช่น 12"
                          />
                          {workoutErrors.value && (
                            <p className="mt-1 text-xs text-rose-400">{workoutErrors.value}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-duration">
                            ระยะเวลา (วินาที)
                          </label>
                          <Input
                            id="workout-duration"
                            type="number"
                            value={workoutForm.duration}
                            onChange={(e) => handleWorkoutFieldChange("duration", e.target.value)}
                            placeholder="เช่น 60"
                          />
                          {workoutErrors.duration && (
                            <p className="mt-1 text-xs text-rose-400">{workoutErrors.duration}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-image">
                          อัปโหลดรูปภาพ
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:border-emerald-500">
                            <Upload size={16} /> เลือกรูปภาพ
                            <input
                              id="workout-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpload("image", e.target.files)}
                            />
                          </label>
                          {workoutForm.image && (
                            <span className="text-xs text-gray-400">{workoutForm.image}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="workout-video">
                          อัปโหลดวิดีโอสอน
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:border-emerald-500">
                            <Upload size={16} /> เลือกวิดีโอ
                            <input
                              id="workout-video"
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => handleUpload("video", e.target.files)}
                            />
                          </label>
                          {workoutForm.video && (
                            <span className="text-xs text-gray-400">{workoutForm.video}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="secondary" onClick={() => setWorkoutForm(emptyWorkoutForm())}>
                        รีเซ็ต
                      </Button>
                      <Button onClick={handleSaveWorkout}>
                        <Save size={16} /> {editingWorkoutId ? "อัปเดตชุดโปรแกรม" : "เพิ่มชุดโปรแกรม"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6 text-center text-gray-400">เลือกโปรแกรมเพื่อดูรายละเอียด</Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

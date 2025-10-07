import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Input, Textarea, Badge } from "../components/ui.jsx";
import { exercisesData } from "../data/fitnessData.js";
import { Dumbbell, Search, Filter, Plus, Flame, Clock, CheckCircle2 } from "lucide-react";

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
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercisesData[0]?.id ?? null);

  const filteredExercises = useMemo(() => {
    const term = query.toLowerCase();
    return exercisesData.filter((exercise) => {
      const matchesQuery =
        exercise.name.toLowerCase().includes(term) ||
        exercise.description.toLowerCase().includes(term) ||
        exercise.muscles.some((muscle) => muscle.toLowerCase().includes(term));
      const matchesMuscle =
        muscleFilter === "all" || exercise.muscles.map((m) => m.toLowerCase()).includes(muscleFilter.toLowerCase());
      const matchesType = typeFilter === "all" || exercise.type === typeFilter;
      return matchesQuery && matchesMuscle && matchesType;
    });
  }, [query, muscleFilter, typeFilter]);

  useEffect(() => {
    if (filteredExercises.length === 0) {
      setSelectedExerciseId(null);
      return;
    }
    if (!filteredExercises.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(filteredExercises[0].id);
    }
  }, [filteredExercises, selectedExerciseId]);

  const selectedExercise = filteredExercises.find((exercise) => exercise.id === selectedExerciseId) ??
    filteredExercises[0] ??
    exercisesData[0] ??
    null;

  const stats = useMemo(() => {
    const total = filteredExercises.length;
    const totalCalories = filteredExercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned ?? 0), 0);
    const repsCount = filteredExercises.filter((exercise) => exercise.type === "reps").length;
    const timeCount = filteredExercises.filter((exercise) => exercise.type === "time").length;
    return { total, totalCalories, repsCount, timeCount };
  }, [filteredExercises]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
            <Dumbbell size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">คลังท่าฝึกออกกำลังกาย</h1>
            <p className="text-sm text-gray-400">ค้นหาและจัดการรายละเอียดของท่าฝึกที่ใช้ในโปรแกรม</p>
          </div>
        </div>
        <Button variant="secondary" className="w-full md:w-auto">
          <Plus size={16} /> เพิ่มท่าฝึกใหม่
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="text-sm text-gray-400">จำนวนท่าฝึกทั้งหมด</div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.total}</div>
          <p className="text-xs text-gray-500">ผลลัพธ์ตามการค้นหา</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>แบบจำนวนครั้ง</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.repsCount}</div>
          <p className="text-xs text-gray-500">ท่าฝึกที่กำหนดด้วยจำนวนครั้ง</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>แบบจับเวลา</span>
            <Clock size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.timeCount}</div>
          <p className="text-xs text-gray-500">ท่าฝึกที่กำหนดด้วยเวลา</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>พลังงานรวม</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.totalCalories}</div>
          <p className="text-xs text-gray-500">แคลอรีที่เผาผลาญรวม</p>
        </Card>
      </div>

      <div className="grid gap-4 rounded-2xl border border-gray-700 bg-gray-900/60 p-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="exercise-search">
            ค้นหาท่าฝึก
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="exercise-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาจากชื่อท่าฝึก คำอธิบาย หรือกล้ามเนื้อที่เกี่ยวข้อง"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="exercise-muscle">
            กล้ามเนื้อเป้าหมาย
          </label>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              id="exercise-muscle"
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {muscleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="exercise-type">
            ประเภทการกำหนด
          </label>
          <select
            id="exercise-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">ทั้งหมด</option>
            <option value="reps">จำนวนครั้ง</option>
            <option value="time">เวลา</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className={`cursor-pointer border ${
                exercise.id === selectedExercise?.id ? "border-sky-500" : "border-gray-700"
              } bg-gray-900/70 p-5 transition hover:border-sky-400/70`}
              onClick={() => setSelectedExerciseId(exercise.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                  <p className="text-xs text-gray-400">{exercise.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    {exercise.muscles.map((muscle) => (
                      <span key={muscle} className="rounded-full bg-gray-800 px-3 py-1">
                        #{muscle}
                      </span>
                    ))}
                  </div>
                </div>
                <Badge variant={exercise.type === "reps" ? "success" : "blue"}>
                  {exercise.type === "reps" ? "จำนวนครั้ง" : "เวลา"}
                </Badge>
              </div>
            </Card>
          ))}
          {filteredExercises.length === 0 && (
            <Card className="p-6 text-center text-gray-400">ไม่พบข้อมูลท่าฝึกตามเงื่อนไขที่เลือก</Card>
          )}
        </div>

        {selectedExercise ? (
          <Card className="space-y-6 border border-gray-700 bg-gray-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">รายละเอียดท่าฝึก</h2>
                <p className="text-sm text-gray-400">จัดการข้อมูลเพื่อให้การฝึกมีประสิทธิภาพสูงสุด</p>
              </div>
              <Badge variant={selectedExercise.type === "reps" ? "success" : "blue"}>
                {selectedExercise.type === "reps" ? "จำนวนครั้ง" : "เวลา"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">ชื่อท่าฝึก</label>
                <Input value={selectedExercise.name} readOnly className="bg-gray-800/80" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">พลังงานที่เผาผลาญ</label>
                <Input value={`${selectedExercise.caloriesBurned} แคลอรี`} readOnly className="bg-gray-800/80" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">รายละเอียด</label>
              <Textarea value={selectedExercise.description} readOnly rows={3} className="bg-gray-800/80" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">คำแนะนำการปฏิบัติ</label>
              <Textarea value={selectedExercise.tips} readOnly rows={3} className="bg-gray-800/80" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {selectedExercise.type === "reps" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">จำนวนครั้งที่แนะนำ</label>
                  <Input value={`${selectedExercise.value} ครั้ง`} readOnly className="bg-gray-800/80" />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">ระยะเวลาที่แนะนำ</label>
                  <Input value={`${selectedExercise.duration} วินาที`} readOnly className="bg-gray-800/80" />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">ไฟล์วิดีโอ</label>
                <Input value={selectedExercise.video} readOnly className="bg-gray-800/80" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">รูปภาพประกอบ</label>
                <Input value={selectedExercise.image} readOnly className="bg-gray-800/80" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">กล้ามเนื้อเป้าหมาย</label>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.muscles.map((muscle) => (
                    <Badge key={muscle} className="bg-gray-800 text-gray-300">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-10 text-center text-gray-400">เลือกท่าฝึกจากด้านซ้ายเพื่อดูรายละเอียด</Card>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Card, Badge, Input, Button } from "../components/ui.jsx";
import { MessageSquare, Filter, Star, ThumbsUp, Flag } from "lucide-react";

const initialFeedback = [
  {
    id: "f1",
    targetType: "program",
    targetName: "Full Body Workout",
    rating: 5,
    comment: "โปรแกรมครบทุกส่วน รู้สึกได้ใช้กล้ามเนื้อทั้งตัว",
    user: "คุณวีรพล",
    createdAt: "2024-02-18",
    likes: 18,
    tags: ["cardio", "fat-burn"],
  },
  {
    id: "f2",
    targetType: "exercise",
    targetName: "Dumbbell Curl",
    rating: 4,
    comment: "ท่าสอนเข้าใจง่าย แต่วิดีโอโหลดช้านิดหน่อย",
    user: "Coach A",
    createdAt: "2024-02-16",
    likes: 11,
    tags: ["arms", "strength"],
  },
  {
    id: "f3",
    targetType: "program",
    targetName: "Core Stability",
    rating: 5,
    comment: "ชอบที่มีการไล่ระดับความยาก ทำตามได้แม้เป็นมือใหม่",
    user: "คุณจิราพร",
    createdAt: "2024-02-14",
    likes: 22,
    tags: ["core", "beginner"],
  },
  {
    id: "f4",
    targetType: "exercise",
    targetName: "Plank",
    rating: 3,
    comment: "อยากได้เทคนิคเพิ่มเติมสำหรับคนที่ปวดหลัง",
    user: "NinjaFit",
    createdAt: "2024-02-12",
    likes: 4,
    tags: ["core", "tips"],
  },
  {
    id: "f5",
    targetType: "program",
    targetName: "Lower Body Strength",
    rating: 4,
    comment: "ดีมากแต่ขอเพิ่มการยืดเหยียดก่อนเริ่ม",
    user: "คุณภานุ",
    createdAt: "2024-02-10",
    likes: 9,
    tags: ["legs", "mobility"],
  },
];

const filterOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "program", label: "เฉพาะโปรแกรม" },
  { value: "exercise", label: "เฉพาะท่าฝึก" },
];

export default function Feedback() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredFeedback = useMemo(() => {
    return initialFeedback.filter((item) => {
      const matchesType = filter === "all" || item.targetType === filter;
      const matchesQuery =
        item.targetName.toLowerCase().includes(query.toLowerCase()) ||
        item.comment.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [query, filter]);

  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    const avg =
      total === 0
        ? 0
        : filteredFeedback.reduce((sum, item) => sum + item.rating, 0) / total;
    const programCount = filteredFeedback.filter((item) => item.targetType === "program").length;
    const exerciseCount = filteredFeedback.filter((item) => item.targetType === "exercise").length;
    return { total, avg: avg.toFixed(1), programCount, exerciseCount };
  }, [filteredFeedback]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">ความคิดเห็นและรีวิว</h1>
            <p className="text-sm text-gray-400">ติดตามเสียงตอบรับจากผู้ใช้ทั้งระดับโปรแกรมและท่าฝึก</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-gray-300 md:text-right">
          <span>รายการทั้งหมด: <span className="font-semibold text-white">{stats.total}</span></span>
          <span>คะแนนเฉลี่ย: <span className="font-semibold text-emerald-400">{stats.avg}</span></span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-900/60 p-6 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="feedback-search">
            ค้นหาความคิดเห็น
          </label>
          <Input
            id="feedback-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาจากชื่อโปรแกรม ท่าฝึก หรือคำแนะนำ..."
          />
        </div>
        <div className="w-full lg:w-56">
          <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="feedback-filter">
            ประเภทเนื้อหา
          </label>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              id="feedback-filter"
              className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">ทั้งหมด</div>
            <MessageSquare size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.total}</div>
          <p className="text-xs text-gray-500">ความคิดเห็นทั้งหมดที่พบ</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">โปรแกรม</div>
            <Star size={18} className="text-yellow-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.programCount}</div>
          <p className="text-xs text-gray-500">เฉพาะโปรแกรมออกกำลังกาย</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">ท่าฝึก</div>
            <ThumbsUp size={18} className="text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.exerciseCount}</div>
          <p className="text-xs text-gray-500">ข้อเสนอแนะสำหรับท่าฝึก</p>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <Card key={item.id} className="border-gray-700/80 bg-gray-900/70 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={item.targetType === "program" ? "success" : "blue"}>
                    {item.targetType === "program" ? "โปรแกรม" : "ท่าฝึก"}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white">{item.targetName}</h3>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={16} fill={index < item.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300">{item.comment}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>โดย {item.user}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString("th-TH")}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 self-start">
                <Button variant="ghost" size="sm" className="text-emerald-300 hover:text-emerald-200">
                  <ThumbsUp size={16} /> {item.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-300 hover:text-rose-200">
                  <Flag size={16} /> แจ้งเตือน
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredFeedback.length === 0 && (
          <Card className="p-10 text-center text-gray-400">
            ไม่พบความคิดเห็นที่ตรงกับเงื่อนไขการค้นหา
          </Card>
        )}
      </div>
    </div>
  );
}

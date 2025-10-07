import React, { useEffect, useMemo, useState } from "react";
import { Card, Badge, Input, Button } from "../components/ui.jsx";
import { MessageSquare, Filter, Star, ThumbsUp, Flag } from "lucide-react";

import { fetchFeedback } from "../api/client.js";

const filterOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "program", label: "เฉพาะโปรแกรม" },
  { value: "exercise", label: "เฉพาะท่าฝึก" },
];

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFeedback()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              tags: Array.isArray(item.tags) ? item.tags : [],
            }))
          : [];
        setFeedback(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("ไม่สามารถดึงข้อมูลความคิดเห็น", err);
        setError("ไม่สามารถโหลดความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง");
        setFeedback([]);
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

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const matchesType = filter === "all" || item.targetType === filter;
      const matchesQuery =
        item.targetName.toLowerCase().includes(query.toLowerCase()) ||
        item.comment.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [feedback, filter, query]);

  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    const avg =
      total === 0
        ? 0
        : filteredFeedback.reduce((sum, item) => sum + (item.rating ?? 0), 0) / total;
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
            disabled={loading || !!error}
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
              disabled={loading || !!error}
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

      {loading ? (
        <Card className="p-6 text-center text-gray-400">กำลังโหลดความคิดเห็น...</Card>
      ) : error ? (
        <Card className="space-y-4 border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-100">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </Card>
      ) : feedback.length === 0 ? (
        <Card className="p-6 text-center text-gray-400">ยังไม่มีความคิดเห็นจากผู้ใช้</Card>
      ) : (
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
                        <Star
                          key={index}
                          size={16}
                          fill={index < (item.rating ?? 0) ? "currentColor" : "none"}
                          strokeWidth={1.5}
                        />
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
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ThumbsUp size={16} /> {item.likes ?? 0}
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-300 hover:text-rose-200">
                    <Flag size={16} /> รายงาน
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredFeedback.length === 0 && (
            <Card className="p-6 text-center text-gray-400">ไม่พบความคิดเห็นที่ตรงกับการค้นหา</Card>
          )}
        </div>
      )}
    </div>
  );
}

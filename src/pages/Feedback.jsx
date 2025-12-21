import React, { useEffect, useMemo, useState } from "react";
import { Card, Input, Button } from "../components/ui.jsx";
import {
  MessageSquare,
  Star,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

import { fetchProgramsWithFeedback } from "../api/client.js";
import "../css/Feedback.css";

const filterOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "program", label: "เฉพาะโปรแกรม" },
];

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================
     LOAD REAL DATA (PROGRAM)
     ======================= */
  useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProgramsWithFeedback();

      if (cancelled) return;

      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            // บังคับให้รูปแบบพร้อมใช้งาน
            id: item.id || item._id,
            targetType: "program",
            targetName: item.targetName || item.name || "ไม่ระบุชื่อโปรแกรม",
            imageUrl: item.imageUrl || item.image || null,
            sentimentData: item.sentimentData || item.DataFeedback || { easy: 0, medium: 0, hard: 0 },
            tags: Array.isArray(item.tags) ? item.tags : [],
          }))
        : [];

      setFeedback(normalized);
    } catch (err) {
      if (cancelled) return;
      setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
      setFeedback([]); // ✅ ไม่มี mock แล้ว
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);


  /* =======================
     FILTER & SEARCH
     ======================= */
  const filteredFeedback = useMemo(() => {
    const q = (query || "").trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesType = filter === "all" || item.targetType === filter;
      const name = (item.targetName || "").toLowerCase();
      const matchesQuery = !q || name.includes(q);
      return matchesType && matchesQuery;
    });
  }, [feedback, filter, query]);

  /* =======================
     STATS
     ======================= */
  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    return { total };
  }, [filteredFeedback]);

  /* =======================
     SENTIMENT BAR
     ======================= */
  const renderSentimentBars = (sentimentData) => {
    const maxValue = Math.max(
      sentimentData.easy,
      sentimentData.medium,
      sentimentData.hard,
      1
    );

    return (
      <div className="sentiment-bars">
        <div className="sentiment-row">
          <div className="sentiment-icon happy">
            <Smile size={22} />
          </div>
          <div className="sentiment-label">ง่าย</div>
          <div className="sentiment-bar-container">
            <div
              className="sentiment-bar easy"
              style={{
                width: `${(sentimentData.easy / maxValue) * 100}%`,
              }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.easy}</div>
        </div>

        <div className="sentiment-row">
          <div className="sentiment-icon neutral">
            <Meh size={22} />
          </div>
          <div className="sentiment-label">ปานกลาง</div>
          <div className="sentiment-bar-container">
            <div
              className="sentiment-bar medium"
              style={{
                width: `${(sentimentData.medium / maxValue) * 100}%`,
              }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.medium}</div>
        </div>

        <div className="sentiment-row">
          <div className="sentiment-icon sad">
            <Frown size={22} />
          </div>
          <div className="sentiment-label">ยากมาก</div>
          <div className="sentiment-bar-container">
            <div
              className="sentiment-bar hard"
              style={{
                width: `${(sentimentData.hard / maxValue) * 100}%`,
              }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.hard}</div>
        </div>
      </div>
    );
  };

  /* =======================
     RENDER
     ======================= */
  return (
    <div className="feedback-container">
      <header className="feedback-header">
        <div className="feedback-header__left">
          <div className="feedback-icon">
            <MessageSquare size={28} />
          </div>
          <div className="feedback-titles">
            <h1 className="feedback-title">Feedback โปรแกรมออกกำลังกาย</h1>
            <p className="feedback-subtitle">
              สรุประดับความยากจากผู้ใช้งาน (Easy / Medium / Hard)
            </p>
          </div>
        </div>

        <div className="feedback-header__right">
          <div className="feedback-stat">
            <div className="feedback-stat__label">โปรแกรมทั้งหมด</div>
            <div className="feedback-stat__value">{stats.total}</div>
          </div>
        </div>
      </header>

      <section className="feedback-controls">
        <div className="feedback-controls__search">
          <label className="feedback-label">ค้นหาโปรแกรม</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อโปรแกรม..."
            disabled={loading || !!error}
          />
        </div>

        <div className="feedback-controls__filter">
          <label className="feedback-label">ประเภท</label>
          <select
            className="feedback-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading || !!error}
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="feedback-main">
        {loading ? (
          <Card className="feedback-message">กำลังโหลดข้อมูล...</Card>
        ) : error ? (
          <Card className="feedback-error">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>
              โหลดใหม่อีกครั้ง
            </Button>
          </Card>
        ) : filteredFeedback.length === 0 ? (
          <Card className="feedback-empty">ยังไม่มีข้อมูล Feedback</Card>
        ) : (
          <div className="feedback-list">
            {filteredFeedback.map((item) => (
              <Card key={item.id || item._id || item.targetName} className="feedback-item">
                <div className="feedback-item__inner">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.targetName}
                      className="feedback-item__image"
                    />
                  )}

                  <div className="feedback-item__main">
                    <h3 className="feedback-item__title">
                      {item.targetName}
                    </h3>
                    {renderSentimentBars(item.sentimentData)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Card, Badge, Input, Button } from "../components/ui.jsx";
import { MessageSquare, Filter, Star, ThumbsUp, Flag } from "lucide-react";

import { fetchFeedback } from "../api/client.js";
import "../css/Feedback.css";

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
    const q = (query || "").trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesType = filter === "all" || item.targetType === filter;
      const name = (item.targetName || "").toLowerCase();
      const comment = (item.comment || "").toLowerCase();
      const tags = (item.tags || []).map((t) => (t || "").toLowerCase());
      const matchesQuery =
        !q ||
        name.includes(q) ||
        comment.includes(q) ||
        tags.some((tag) => tag.includes(q));
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
    <div className="feedback-container">
      <header className="feedback-header">
        <div className="feedback-header__left">
          <div className="feedback-icon">
            <MessageSquare size={28} />
          </div>
          <div className="feedback-titles">
            <h1 className="feedback-title">ความคิดเห็นและรีวิว</h1>
            <p className="feedback-subtitle">ติดตามเสียงตอบรับจากผู้ใช้ทั้งระดับโปรแกรมและท่าฝึก</p>
          </div>
        </div>

        <div className="feedback-header__right">
          <div className="feedback-stat">
            <div className="feedback-stat__label">รายการทั้งหมด</div>
            <div className="feedback-stat__value">{stats.total}</div>
          </div>
          <div className="feedback-stat">
            <div className="feedback-stat__label">คะแนนเฉลี่ย</div>
            <div className="feedback-stat__value">{stats.avg}</div>
          </div>
        </div>
      </header>

      <section className="feedback-controls">
        <div className="feedback-controls__search">
          <label htmlFor="feedback-search" className="feedback-label">ค้นหาความคิดเห็น</label>
          <Input
            id="feedback-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาจากชื่อโปรแกรม ท่าฝึก หรือคำแนะนำ..."
            disabled={loading || !!error}
          />
        </div>

        <div className="feedback-controls__filter">
          <label htmlFor="feedback-filter" className="feedback-label">ประเภทเนื้อหา</label>
          <div className="feedback-filter-row">
            <Filter size={16} />
            <select
              id="feedback-filter"
              className="feedback-select"
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
      </section>

      <section className="feedback-summary-grid">
        <Card className="feedback-summary">
          <div className="summary-left">
            <div className="summary-label">ทั้งหมด</div>
            <div className="summary-value">{stats.total}</div>
            <div className="summary-desc">ความคิดเห็นทั้งหมดที่พบ</div>
          </div>
          <div className="summary-icon"><MessageSquare size={20} /></div>
        </Card>

        <Card className="feedback-summary">
          <div className="summary-left">
            <div className="summary-label">โปรแกรม</div>
            <div className="summary-value">{stats.programCount}</div>
            <div className="summary-desc">เฉพาะโปรแกรมออกกำลังกาย</div>
          </div>
          <div className="summary-icon"><Star size={20} /></div>
        </Card>

        <Card className="feedback-summary">
          <div className="summary-left">
            <div className="summary-label">ท่าฝึก</div>
            <div className="summary-value">{stats.exerciseCount}</div>
            <div className="summary-desc">ข้อเสนอแนะสำหรับท่าฝึก</div>
          </div>
          <div className="summary-icon"><ThumbsUp size={20} /></div>
        </Card>
      </section>

      <main className="feedback-main">
        {loading ? (
          <Card className="feedback-message">กำลังโหลดความคิดเห็น...</Card>
        ) : error ? (
          <Card className="feedback-error">
            <p>{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              ลองใหม่อีกครั้ง
            </Button>
          </Card>
        ) : feedback.length === 0 ? (
          <Card className="feedback-empty">ยังไม่มีความคิดเห็นจากผู้ใช้</Card>
        ) : (
          <div className="feedback-list">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="feedback-item">
                <div className="feedback-item__inner">
                  <div className="feedback-item__main">
                    <div className="feedback-item__meta">
                      <Badge variant={item.targetType === "program" ? "success" : "blue"}>
                        {item.targetType === "program" ? "โปรแกรม" : "ท่าฝึก"}
                      </Badge>
                      <h3 className="feedback-item__title">{item.targetName}</h3>
                      <div className="feedback-stars">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={index < (item.rating ?? 0) ? "star filled" : "star"}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="feedback-item__comment">{item.comment}</p>

                    <div className="feedback-item__meta-row">
                      <span>โดย {item.user}</span>
                      <span className="dot">•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString("th-TH")}</span>
                      <div className="feedback-tags">
                        {(item.tags || []).map((tag) => (
                          <span key={tag} className="feedback-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="feedback-item__actions">
                    <div className="likes">
                      <ThumbsUp size={16} /> <span>{item.likes ?? 0}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="report-button">
                      <Flag size={16} /> รายงาน
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredFeedback.length === 0 && (
              <Card className="feedback-no-match">ไม่พบความคิดเห็นที่ตรงกับการค้นหา</Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


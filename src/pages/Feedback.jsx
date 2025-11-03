import React, { useEffect, useMemo, useState } from "react";
import { Card, Badge, Input, Button } from "../components/ui.jsx";
import { MessageSquare, Filter, Star, ThumbsUp, Flag, Smile, Meh, Frown } from "lucide-react";

import { fetchFeedback } from "../api/client.js";
import "../css/Feedback.css";

const filterOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "program", label: "เฉพาะโปรแกรม" },
  { value: "exercise", label: "เฉพาะท่าฝึก" },
];

// Mock data
const mockFeedbackData = [
  {
    id: 1,
    targetType: "exercise",
    targetName: "ยกดัมเบล",
    rating: 4,
    comment: "ท่านี้ดีมาก ช่วยสร้างกล้ามเนื้อแขนได้ดี",
    user: "สมชาย ใจดี",
    createdAt: "2024-10-20T10:30:00",
    tags: ["แขน", "ดัมเบล"],
    likes: 12,
    sentimentData: { easy: 3, medium: 6, hard: 1 },
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    targetType: "exercise",
    targetName: "ดันพื้น",
    rating: 5,
    comment: "ท่าฝึกที่ดีเยี่ยม เหมาะสำหรับมือใหม่",
    user: "วิไล สวยงาม",
    createdAt: "2024-10-22T14:20:00",
    tags: ["หน้าอก", "พื้นฐาน"],
    likes: 8,
    sentimentData: { easy: 6, medium: 6, hard: 4 },
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    targetType: "program",
    targetName: "โปรแกรมลดน้ำหนัก 30 วัน",
    rating: 5,
    comment: "โปรแกรมนี้ช่วยลดน้ำหนักได้จริง แนะนำเลยค่ะ",
    user: "มานี รักสุขภาพ",
    createdAt: "2024-10-23T09:15:00",
    tags: ["ลดน้ำหนัก", "คาร์ดิโอ"],
    likes: 25,
    sentimentData: { easy: 2, medium: 8, hard: 5 },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop"
  },
  {
    id: 4,
    targetType: "program",
    targetName: "สร้างกล้ามเนื้อ 8 สัปดาห์",
    rating: 4,
    comment: "โปรแกรมดีมาก เห็นผลชัดเจน",
    user: "ประยุทธ์ แข็งแรง",
    createdAt: "2024-10-24T16:45:00",
    tags: ["กล้ามเนื้อ", "ยกน้ำหนัก"],
    likes: 18,
    sentimentData: { easy: 1, medium: 4, hard: 8 },
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"
  },
  {
    id: 5,
    targetType: "exercise",
    targetName: "สควอท",
    rating: 5,
    comment: "ท่านี้ดีสำหรับขาและสะโพก",
    user: "สุดา ฟิต",
    createdAt: "2024-10-25T08:00:00",
    tags: ["ขา", "สะโพก"],
    likes: 15,
    sentimentData: { easy: 4, medium: 5, hard: 3 },
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=400&fit=crop"
  }
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

    // Try to fetch real data, fallback to mock data
    fetchFeedback()
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data) && data.length > 0
          ? data.map((item) => ({
              ...item,
              tags: Array.isArray(item.tags) ? item.tags : [],
              sentimentData: item.sentimentData || { easy: 3, medium: 6, hard: 1 },
              imageUrl: item.imageUrl || null,
            }))
          : mockFeedbackData;
        setFeedback(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("ใช้ mock data แทน:", err);
        // Use mock data on error
        setFeedback(mockFeedbackData);
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

  const renderSentimentBars = (sentimentData) => {
    const maxValue = Math.max(sentimentData.easy, sentimentData.medium, sentimentData.hard, 1);

    return (
      <div className="sentiment-bars">
        <div className="sentiment-row">
          <div className="sentiment-icon happy">
            <Smile size={24} />
          </div>
          <div className="sentiment-label">ง่าย</div>
          <div className="sentiment-bar-container">
            <div 
              className="sentiment-bar easy" 
              style={{ width: `${(sentimentData.easy / maxValue) * 100}%` }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.easy}</div>
        </div>

        <div className="sentiment-row">
          <div className="sentiment-icon neutral">
            <Meh size={24} />
          </div>
          <div className="sentiment-label">ปานกลาง</div>
          <div className="sentiment-bar-container">
            <div 
              className="sentiment-bar medium" 
              style={{ width: `${(sentimentData.medium / maxValue) * 100}%` }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.medium}</div>
        </div>

        <div className="sentiment-row">
          <div className="sentiment-icon sad">
            <Frown size={24} />
          </div>
          <div className="sentiment-label">ยากมาก</div>
          <div className="sentiment-bar-container">
            <div 
              className="sentiment-bar hard" 
              style={{ width: `${(sentimentData.hard / maxValue) * 100}%` }}
            />
          </div>
          <div className="sentiment-count">{sentimentData.hard}</div>
        </div>
      </div>
    );
  };

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
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.targetName}
                      className="feedback-item__image"
                    />
                  )}
                  
                  <div className="feedback-item__main">
                    <h3 className="feedback-item__title">{item.targetName}</h3>
                    
                    {item.sentimentData && renderSentimentBars(item.sentimentData)}
                  </div>

                  {/* <div className="feedback-item__actions">
                    <Button variant="primary" className="feedback-button">
                      Feedback
                    </Button>
                  </div> */}
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
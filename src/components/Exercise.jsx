import React from "react";
import { Button, Input, Textarea, Card } from "../components/ui.jsx";
import { Upload, Save } from "lucide-react";

export default function Exercise({
  form,
  errors = {},
  editing = false,
  onChange,
  onUpload,
  onCancel,
  onSave,
}) {
  const handleChange = (field) => (e) => onChange?.(field, e.target.value);

  return (
    <Card className="workout-form">
      <div className="workout-form__header">
        <h2 className="workout-form__title">จัดการท่าออกกำลังกาย</h2>
        <p className="workout-form__subtitle">เพิ่มหรือแก้ไขท่าในโปรแกรม</p>
      </div>

      <div className="workout-form__body">
        <div className="form-group">
          <label className="form-label" htmlFor="workout-name">ชื่อท่า</label>
          <Input id="workout-name" value={form.name} onChange={handleChange("name")} placeholder="Warm-up Session" />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="workout-description">รายละเอียด</label>
          <Textarea id="workout-description" rows={3} value={form.description} onChange={handleChange("description")} placeholder="คำอธิบายสั้น ๆ" />
          {errors.description && <p className="form-error">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="workout-muscles">กล้ามเนื้อ (คั่นด้วย ,)</label>
          <Input id="workout-muscles" value={form.musclesText} onChange={handleChange("musclesText")} placeholder="chest, arms" />
          {errors.muscles && <p className="form-error">{errors.muscles}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="workout-type">ประเภท</label>
            <select id="workout-type" value={form.type} onChange={handleChange("type")} className="form-select">
              <option value="reps">จำนวนครั้ง</option>
              <option value="time">เวลา</option>
            </select>
          </div>

          {form.type === "reps" ? (
            <div className="form-group">
              <label className="form-label" htmlFor="workout-value">จำนวนครั้ง (reps)</label>
              <Input id="workout-value" value={form.value} onChange={handleChange("value")} placeholder="12" />
              {errors.value && <p className="form-error">{errors.value}</p>}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="workout-duration">ระยะเวลา (วินาที)</label>
              <Input id="workout-duration" value={form.duration} onChange={handleChange("duration")} placeholder="60" />
              {errors.duration && <p className="form-error">{errors.duration}</p>}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="workout-image">รูปภาพ</label>
            <div className="file-upload">
              <label className="file-upload__label">
                <Upload size={16} />
                <span>อัปโหลดรูปภาพ</span>
                <input id="workout-image" type="file" accept="image/*" className="file-upload__input" onChange={(e) => onUpload?.("image", e.target.files)} />
              </label>
              {form.image && <span className="file-upload__filename">{form.image}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="workout-video">วิดีโอ</label>
            <div className="file-upload">
              <label className="file-upload__label">
                <Upload size={16} />
                <span>อัปโหลดวิดีโอ</span>
                <input id="workout-video" type="file" accept="video/*" className="file-upload__input" onChange={(e) => onUpload?.("video", e.target.files)} />
              </label>
              {form.video && <span className="file-upload__filename">{form.video}</span>}
            </div>
          </div>
        </div>

        <div className="workout-form__actions">
          <Button variant="secondary" onClick={onCancel}>ยกเลิก</Button>
          <Button onClick={onSave}>
            <Save size={16} />
            <span>{editing ? "บันทึกการแก้ไข" : "เพิ่มท่า"}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}


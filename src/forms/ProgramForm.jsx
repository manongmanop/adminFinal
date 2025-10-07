import React, { useState } from "react";
import { Input, Button, Label, Textarea, Badge } from "../components/ui.jsx";
import { Plus } from "lucide-react";

export default function ProgramForm({ initial, onSubmit }) {
  const [values, setValues] = useState(
    initial ?? { name: "", level: "Beginner", goal: "Fat Loss", description: "" }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = "กรุณาใส่ชื่อโปรแกรม";
    if (!values.level) e.level = "เลือกระดับ";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit?.(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">ชื่อโปรแกรม</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="ค้นชื่อโปรแกรมฟิตเนส"
        />
        {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="level">ระดับความยาก</Label>
          <select
            id="level"
            className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            value={values.level}
            onChange={(e) => set("level", e.target.value)}
          >
            <option value="Beginner">เริ่มต้น</option>
            <option value="Intermediate">ปานกลาง</option>
            <option value="Advanced">ขั้นสูง</option>
          </select>
        </div>

        <div>
          <Label htmlFor="goal">เป้าหมาย</Label>
          <select
            id="goal"
            className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            value={values.goal}
            onChange={(e) => set("goal", e.target.value)}
          >
            <option value="Fat Loss">ลดน้ำหนัก</option>
            <option value="Muscle Gain">เพิ่มกล้ามเนื้อ</option>
            <option value="Endurance">เพิ่มความอึด</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="desc">รายละเอียดโปรแกรม</Label>
        <Textarea
          id="desc"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="อธิบายรายละเอียดของโปรแกรมฟิตเนส..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={values.level === "Beginner" ? "success" : values.level === "Intermediate" ? "warning" : "gray"}>
          {values.level}
        </Badge>
        <Badge>{values.goal}</Badge>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit}>
          <Plus size={16} />
          สร้างโปรแกรม
        </Button>
      </div>
    </div>
  );
}

// client.js (ปรับปรุง)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND ||   // รองรับ config ที่ใช้ใน vite.config.js
  "/api";

// generic request helper (รองรับ 204/ไม่มี body)
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    // ใส่ Content-Type เฉพาะเมื่อส่ง JSON
    ...(options.body
      ? { headers: { "Content-Type": "application/json", ...(options.headers || {}) } }
      : { headers: { ...(options.headers || {}) } }),
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // พยายาม parse JSON เฉพาะเมื่อมี body และเป็น JSON
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204 || ct.indexOf("application/json") === -1) {
    return null;
  }
  return res.json();
}

/* ========== READ endpoints (ใช้ request ชัดเจน) ========== */
export function fetchExercises() {
  return request("/exercises");
}
export function fetchPrograms() {
  return request("/programs");
}
export function fetchFeedback() {
  return request("/feedback");
}
export function fetchUsers() {
  return request("/users");
}
export function fetchCounts() {
  return request("/counts");
}
export function fetchProgramsFeedback() {
  return request("/programs/feedback");
}
/* ========== PROGRAMS write ops (ผ่าน request) ========== */
export function createProgram(data) {
  return request("/programs", { method: "POST", body: JSON.stringify(data) });
}
export function updateProgram(id, data) {
  return request(`/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export function deleteProgram(id) {
  // บางเซิร์ฟเวอร์คืน 204; request จะคืน null
  return request(`/programs/${id}`, { method: "DELETE" });
}

/* ========== EXERCISES write ops (เลิกใช้ BASE ฮาร์ดโค้ด) ========== */
export async function createExercise(payload) {
  const data = await request("/exercises", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // เผื่อเซิร์ฟฯคืนรูปแบบต่างกัน ให้ normalize id เบาๆ
  return { id: data?.id || data?._id || `ex-${Date.now()}`, ...data };
}

export function updateExercise(id, payload) {
  return request(`/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteExercise(id) {
  return request(`/exercises/${id}`, { method: "DELETE" });
}
export function fetchProgramsWithFeedback() {
  return request("/programs/feedback");
}
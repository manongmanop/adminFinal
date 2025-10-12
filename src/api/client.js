const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
  }

  return response.json();
}

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

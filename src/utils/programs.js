// Utilities for Programs page

export const looksLikeObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

export const createEmptyProgram = () => ({
  id: `program-${Date.now()}`,
  name: "",
  description: "",
  duration: "",
  caloriesBurned: 0,
  image: "",
  category: "",
  workoutList: [],
});

export const emptyWorkoutForm = () => ({
  id: null,
  name: "",
  description: "",
  musclesText: "",
  muscles: [],
  type: "reps",
  value: "",
  duration: "",
  image: "",
  video: "",
});

export function resolveImageUrl(src) {
  if (!src) return '';
  let s = typeof src === 'string' ? src : String(src);
  if (/^https?:\/\//i.test(s)) return s;
  s = s.replace(/\\/g, '/');
  s = s.replace(/^[.\/]+/, '');
  s = s.replace(/^(?:uploads\/)*/i, 'uploads/');
  if (s.toLowerCase().startsWith('uploads/')) s = s.slice('uploads/'.length);
  return `/uploads/${s}`;
}


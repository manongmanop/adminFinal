const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const { acceptStatuses, ...fetchOptions } = options;
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(fetchOptions.headers || {}),
  };

  if (isFormData && headers["Content-Type"]) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: fetchOptions.method || (fetchOptions.body ? "POST" : "GET"),
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    if (Array.isArray(acceptStatuses) && acceptStatuses.includes(response.status)) {
      return null;
    }

    const message = await response.text();
    const error = new Error(message || "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง");
  }
}

function normalizeTips(tips) {
  if (!tips) return "";
  if (Array.isArray(tips)) {
    return tips.join("\n");
  }
  return String(tips);
}

function normalizeMuscles(source) {
  if (Array.isArray(source)) return source.filter(Boolean);
  if (typeof source === "string") {
    return source
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeExercise(doc) {
  if (!doc) return null;
  const id = doc._id?.toString?.() ?? doc.id ?? "";
  const valueRaw = doc.value ?? doc.reps ?? null;
  const durationRaw = doc.duration ?? doc.time ?? doc.minutes ?? null;

  return {
    id,
    name: doc.name ?? "",
    description: doc.description ?? "",
    type: doc.type === "time" ? "time" : "reps",
    value: typeof valueRaw === "number" ? valueRaw : Number(valueRaw) || 0,
    duration: typeof durationRaw === "number" ? durationRaw : Number(durationRaw) || 0,
    caloriesBurned: Number(doc.caloriesBurned ?? 0),
    caloriesPerRep: Number(doc.caloriesPerRep ?? 0.5),
    caloriesPerMinute: Number(doc.caloriesPerMinute ?? 5),
    muscles: normalizeMuscles(doc.muscleGroups ?? doc.muscles),
    difficulty: doc.difficulty ?? "beginner",
    equipment: Array.isArray(doc.equipment) ? doc.equipment : [],
    instructions: Array.isArray(doc.instructions) ? doc.instructions : [],
    tips: normalizeTips(doc.tips),
    image: doc.imageUrl ?? doc.image ?? "",
    imageUrl: doc.imageUrl ?? doc.image ?? "",
    video: doc.videoUrl ?? doc.video ?? "",
    videoUrl: doc.videoUrl ?? doc.video ?? "",
  };
}

function normalizeWorkout(workout, fallbackId) {
  const exercise = workout?.exercise ?? workout ?? {};
  const id = workout?._id?.toString?.() ?? exercise._id?.toString?.() ?? fallbackId;

  return {
    id,
    name: exercise.name ?? workout.name ?? "",
    description: exercise.description ?? workout.description ?? "",
    muscles: normalizeMuscles(exercise.muscleGroups ?? workout.muscles),
    type: exercise.type === "time" || workout.type === "time" ? "time" : "reps",
    value: typeof exercise.value === "number"
      ? exercise.value
      : typeof workout.value === "number"
      ? workout.value
      : Number(exercise.value ?? workout.value ?? exercise.reps ?? workout.reps ?? 0) || 0,
    duration: typeof exercise.duration === "number"
      ? exercise.duration
      : typeof workout.duration === "number"
      ? workout.duration
      : Number(exercise.duration ?? workout.duration ?? exercise.time ?? 0) || 0,
    image: exercise.imageUrl ?? exercise.image ?? workout.image ?? "",
    video: exercise.videoUrl ?? exercise.video ?? workout.video ?? "",
  };
}

function normalizeProgram(doc) {
  if (!doc) return null;
  const id = doc._id?.toString?.() ?? doc.id ?? "";

  return {
    id,
    name: doc.name ?? "",
    description: doc.description ?? "",
    duration: doc.duration ?? "",
    caloriesBurned: Number(doc.caloriesBurned ?? 0),
    image: doc.image ?? "",
    category: doc.category ?? "",
    workoutList: Array.isArray(doc.workoutList)
      ? doc.workoutList.map((workout, index) =>
          normalizeWorkout(workout, `${id}-workout-${index}`)
        )
      : [],
  };
}

function buildFeedbackFromRecents(recents, exercises) {
  const exerciseMap = new Map(
    (exercises || []).map((item) => [item._id?.toString?.() ?? item.id ?? "", item])
  );

  return recents.map((item) => {
    const exercise = exerciseMap.get(item.exerciseId) || {};
    const createdAt = item.date ? new Date(item.date) : new Date();

    return {
      id: item._id?.toString?.() ?? `${item.uid}-${item.exerciseId}-${item.date}`,
      targetType: 'exercise',
      targetName: exercise.name ?? item.exerciseId ?? 'กิจกรรมการออกกำลังกาย',
      comment: `ความก้าวหน้า ${item.progress}${item.unit ? ` ${item.unit}` : ''}`,
      rating: 0,
      user: item.uid ?? 'ไม่ระบุผู้ใช้',
      createdAt: createdAt.toISOString(),
      tags: [item.type, item.unit].filter(Boolean),
    };
  });
}

export async function fetchExercises() {
  const data = await request('/exercises');
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeExercise(item)).filter(Boolean);
}

export async function fetchPrograms() {
  const data = await request('/workout_programs');
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeProgram(item)).filter(Boolean);
}

export async function fetchFeedback() {
  const recents = await request('/recent', { acceptStatuses: [404] });
  if (!Array.isArray(recents) || recents.length === 0) {
    return [];
  }

  const exerciseIds = Array.from(
    new Set(recents.map((item) => item.exerciseId).filter(Boolean))
  );

  let exercises = [];
  if (exerciseIds.length > 0) {
    try {
      const response = await request('/exercises/byIds', {
        method: 'POST',
        body: JSON.stringify({ ids: exerciseIds }),
      });
      if (Array.isArray(response)) {
        exercises = response;
      }
    } catch (error) {
      console.warn('ไม่สามารถดึงข้อมูลท่าฝึกเพิ่มเติมสำหรับ feedback', error);
    }
  }

  return buildFeedbackFromRecents(recents, exercises);
}

export { normalizeExercise, normalizeProgram };

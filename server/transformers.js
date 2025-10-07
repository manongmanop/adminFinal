export function normalizeExercise(doc) {
  if (!doc) {
    return {
      id: "",
      name: "",
      description: "",
      tips: "",
      type: "reps",
      value: null,
      duration: null,
      caloriesBurned: 0,
      muscles: [],
      image: "",
      video: "",
    };
  }

  const type = doc.type || (typeof doc.duration === "number" ? "time" : "reps");
  const rawMuscles = doc.muscleGroups || doc.muscles || [];

  return {
    id: doc._id?.toString?.() || doc.id || "",
    name: doc.name || "",
    description: doc.description || "",
    tips: doc.tips || doc.instructions?.join?.("\n") || "",
    type,
    value:
      type === "reps"
        ? Number(doc.value ?? doc.reps ?? doc.target ?? 0) || null
        : null,
    duration:
      type === "time"
        ? Number(doc.duration ?? doc.time ?? doc.value ?? 0) || null
        : null,
    caloriesBurned: Number(doc.caloriesBurned ?? doc.calories ?? 0) || 0,
    muscles: Array.isArray(rawMuscles)
      ? rawMuscles.map((muscle) => muscle?.toString?.() || muscle).filter(Boolean)
      : [],
    image: doc.imageUrl || doc.image || "",
    video: doc.videoUrl || doc.video || "",
  };
}

export function normalizeProgram(doc, exercisesById = new Map()) {
  const workouts = Array.isArray(doc?.workoutList) ? doc.workoutList : [];

  return {
    id: doc?._id?.toString?.() || doc?.id || "",
    name: doc?.name || "",
    description: doc?.description || "",
    duration: doc?.duration || "",
    caloriesBurned: Number(doc?.caloriesBurned ?? 0) || 0,
    image: doc?.imageUrl || doc?.image || "",
    category: doc?.category || doc?.level || "",
    workoutList: workouts.map((item, index) => {
      const referenceId = item?.exercise?._id?.toString?.() || item?.exercise?.toString?.() || item?.exerciseId;
      const normalizedExercise = exercisesById.get(referenceId);

      const fallbackMuscles = Array.isArray(item?.muscles)
        ? item.muscles.map((muscle) => muscle?.toString?.() || muscle).filter(Boolean)
        : [];

      const resolvedType = normalizedExercise?.type || item?.type || "reps";
      const isTimeBased = resolvedType === "time";

      return {
        id:
          item?._id?.toString?.() ||
          item?.id ||
          `${doc?._id?.toString?.() || "program"}-workout-${index}`,
        exerciseId: referenceId || normalizedExercise?.id || "",
        name: normalizedExercise?.name || item?.name || "",
        description: normalizedExercise?.description || item?.description || "",
        muscles: normalizedExercise?.muscles?.length
          ? [...normalizedExercise.muscles]
          : fallbackMuscles,
        type: resolvedType,
        value: !isTimeBased
          ? normalizedExercise?.value ?? item?.value ?? ""
          : "",
        duration: isTimeBased
          ? normalizedExercise?.duration ?? item?.duration ?? item?.time ?? ""
          : "",
        image: normalizedExercise?.image || item?.image || "",
        video: normalizedExercise?.video || item?.video || "",
      };
    }),
  };
}

export function normalizeFeedback(doc, programs = new Map(), exercises = new Map()) {
  if (!doc) return null;

  const baseTargetId = doc.programId || doc.program || doc.exerciseId || doc.exercise;
  const targetId = baseTargetId?._id?.toString?.() || baseTargetId?.toString?.() || "";

  const targetProgram = programs.get(targetId);
  const targetExercise = exercises.get(targetId);

  const inferredType = doc.targetType || (targetProgram ? "program" : "exercise");

  return {
    id: doc._id?.toString?.() || doc.id || targetId || `feedback-${Date.now()}`,
    targetType: inferredType,
    targetName:
      doc.targetName ||
      targetProgram?.name ||
      targetExercise?.name ||
      (inferredType === "program" ? "โปรแกรม" : "ท่าฝึก"),
    rating: Number(doc.rating ?? doc.score ?? 0) || 0,
    comment: doc.comment || doc.feedback || "",
    user: doc.user || doc.userName || doc.createdBy || "ไม่ระบุชื่อ",
    createdAt:
      doc.createdAt?.toISOString?.() ||
      doc.createdAt ||
      doc.date ||
      new Date().toISOString(),
    likes: Number(doc.likes ?? doc.upvotes ?? 0) || 0,
    tags: Array.isArray(doc.tags)
      ? doc.tags.map((tag) => tag?.toString?.() || tag).filter(Boolean)
      : [],
  };
}

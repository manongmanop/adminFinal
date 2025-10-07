export const exercisesData = [
  {
    id: "6875fadb0f6991e1457e6711",
    name: "Dumbbell Curl",
    description:
      "ท่า Dumbbell Curl เน้นสร้างกล้ามเนื้อต้นแขนด้านหน้า (Biceps) โดยใช้น้ำหนักจากดัมเบลในการสร้างแรงต้าน",
    tips:
      "รักษาข้อศอกให้แนบลำตัว ยกดัมเบลขึ้นช้าๆ ควบคุมน้ำหนักทั้งตอนขึ้นและลง ห้ามใช้แรงเหวี่ยงจากลำตัว",
    type: "reps",
    value: 10,
    duration: null,
    caloriesBurned: 50,
    muscles: ["biceps", "arms"],
    image: "/uploads/image-1753674234276.jpg",
    video: "/uploads/1758804453418_BicepCurl.mp4",
  },
  {
    id: "687605360f6991e1457e6728",
    name: "Squat",
    description:
      "การนั่งลุกเพื่อเสริมสร้างกล้ามเนื้อขาและสะโพก เหมาะสำหรับการเพิ่มความแข็งแรงของ Lower Body",
    tips:
      "ยืดอกและเกร็งหน้าท้อง ดันสะโพกไปข้างหลังเหมือนนั่งเก้าอี้ ควบคุมการเคลื่อนไหวทั้งขึ้นและลง",
    type: "reps",
    value: 15,
    duration: null,
    caloriesBurned: 75,
    muscles: ["legs", "glutes"],
    image: "/uploads/image-1753674604191.jpg",
    video: "/uploads/video-1759058619295.mp4",
  },
  {
    id: "687605170f6991e1457e6727",
    name: "Push Ups",
    description:
      "การวิดพื้นเพื่อเสริมสร้างกล้ามเนื้อแขนและหน้าอก พร้อมช่วยพัฒนากล้ามเนื้อแกนกลางลำตัว",
    tips:
      "วางมือกว้างกว่าหัวไหล่ เกร็งลำตัวให้ตรง ไม่ยกหรือทิ้งสะโพกมากเกินไป",
    type: "reps",
    value: 10,
    duration: null,
    caloriesBurned: 50,
    muscles: ["chest", "arms", "shoulders"],
    image: "/uploads/image-1753674627339.jpg",
    video: "/uploads/video-1759044725336.mp4",
  },
  {
    id: "687602db0f6991e1457e6722",
    name: "Plank",
    description: "การเก็บท่าเพื่อเสริมสร้างกล้ามเนื้อหลังและท้อง",
    tips:
      "วางข้อศอกตรงกับหัวไหล่ เกร็งหน้าท้องและก้นให้ลำตัวเป็นเส้นตรง อย่าให้สะโพกหย่อน",
    type: "time",
    value: null,
    duration: 30,
    caloriesBurned: 25,
    muscles: ["core", "back"],
    image: "/uploads/image-1753674330866.jpg",
    video: "/uploads/video-1759045039492.mp4",
  },
  {
    id: "687604cb0f6991e1457e6725",
    name: "Hip Raise",
    description:
      "ท่า Hip Raise หรือ Glute Bridge เน้นบริหารกล้ามเนื้อบั้นท้ายและต้นขาด้านหลัง",
    tips:
      "นอนหงายชันเข่า ยกสะโพกขึ้นจนลำตัวเป็นเส้นตรง ตั้งแต่หัวเข่าถึงหัวไหล่",
    type: "reps",
    value: 10,
    duration: null,
    caloriesBurned: 50,
    muscles: ["glutes", "hamstrings"],
    image: "/uploads/image-1753675225036.jpg",
    video: "/uploads/video-1759045095663.mp4",
  },
  {
    id: "687604fa0f6991e1457e6726",
    name: "Legs Raise",
    description:
      "ท่า Legs Raise เน้นสร้างความแข็งแรงให้กล้ามเนื้อหน้าท้องส่วนล่างโดยการยกขาขึ้นลง",
    tips:
      "เกร็งหน้าท้องให้แผ่นหลังแนบพื้น ยกขาทั้งสองขึ้นช้าๆ และควบคุมตอนลดลง",
    type: "reps",
    value: 10,
    duration: null,
    caloriesBurned: 50,
    muscles: ["core"],
    image: "/uploads/image-1753675458487.jpg",
    video: "/uploads/video-1759045139306.mp4",
  },
];

const basePrograms = [
  {
    id: "68764eb050ed469ab179b122",
    name: "Full Body Workout",
    description: "โปรแกรมออกกำลังกายสำหรับทุกส่วนของร่างกาย",
    duration: "10:00",
    caloriesBurned: 200,
    image: "uploads/1752583856386.webp",
    category: "Cardio",
    workouts: [
      "6875fadb0f6991e1457e6711",
      "687605360f6991e1457e6728",
      "687605170f6991e1457e6727",
      "687604cb0f6991e1457e6725",
      "687604fa0f6991e1457e6726",
      "687602db0f6991e1457e6722",
    ],
  },
  {
    id: "program-core",
    name: "Core Stability",
    description: "โฟกัสกล้ามเนื้อแกนกลางและความมั่นคงของลำตัว",
    duration: "12:30",
    caloriesBurned: 180,
    image: "uploads/core-stability.webp",
    category: "Strength",
    workouts: ["687602db0f6991e1457e6722", "687604fa0f6991e1457e6726", "687605170f6991e1457e6727"],
  },
  {
    id: "lower-body-power",
    name: "Lower Body Strength",
    description: "เสริมความแข็งแรงขาและสะโพก พร้อมพัฒนาการทรงตัว",
    duration: "09:45",
    caloriesBurned: 190,
    image: "uploads/lower-body-strength.webp",
    category: "Strength",
    workouts: ["687605360f6991e1457e6728", "687604cb0f6991e1457e6725", "687604fa0f6991e1457e6726"],
  },
];

export const getInitialPrograms = () =>
  basePrograms.map((program) => ({
    ...program,
    workoutList: program.workouts.map((exerciseId, index) => {
      const exercise = exercisesData.find((item) => item.id === exerciseId);
      return {
        id: `${program.id}-workout-${index}`,
        name: exercise?.name ?? "",
        description: exercise?.description ?? "",
        muscles: exercise?.muscles ? [...exercise.muscles] : [],
        type: exercise?.type ?? "reps",
        value: exercise?.type === "reps" ? exercise?.value ?? "" : "",
        duration: exercise?.type === "time" ? exercise?.duration ?? "" : "",
        image: exercise?.image ?? "",
        video: exercise?.video ?? "",
      };
    }),
  }));

export const createEmptyProgram = () => ({
  id: `program-${Date.now()}`,
  name: "โปรแกรมใหม่",
  description: "อธิบายรายละเอียดโปรแกรม",
  duration: "",
  caloriesBurned: 0,
  image: "",
  category: "",
  workoutList: [],
});

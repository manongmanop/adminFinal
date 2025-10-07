import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyMetricsData from './test-bodymetrics.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

void bodyMetricsData; // keep reference for potential seeding

const app = express();
const PORT = process.env.PORT || 5000;

const { Schema } = mongoose;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('ไม่อนุญาตให้อัปโหลดไฟล์ประเภทนี้! กรุณาอัปโหลดเฉพาะรูปภาพหรือวิดีโอ'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

mongoose
  .connect('mongodb://127.0.0.1:27017/fitness_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

const bodyMetricSchema = new Schema(
  {
    userId: {
      type: Schema.Types.String,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    bmi: {
      type: Number,
    },
    fatPercentage: {
      type: Number,
    },
    muscleMass: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const BodyMetric = mongoose.model('BodyMetric', bodyMetricSchema);

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  caloriesBurned: { type: Number, default: 0 },
  workoutsDone: { type: Number, default: 0 },
  weeklyGoal: { type: Number, default: 3 },
  workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'users');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  video: { type: String, default: null },
  videoUrl: { type: String, default: null },
  type: { type: String, enum: ['reps', 'time'], required: true },
  value: { type: Number },
  duration: { type: Number },
  time: { type: Number },
  minutes: { type: Number },
  reps: { type: Number },
  caloriesBurned: { type: Number, default: 0 },
  caloriesPerRep: { type: Number, default: 0.5 },
  caloriesPerMinute: { type: Number, default: 5 },
  muscleGroups: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  equipment: [{ type: String }],
  instructions: [{ type: String }],
  tips: [{ type: String }],
  image: { type: String },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

const workoutProgramSchema = new Schema({
  name: String,
  description: String,
  duration: String,
  caloriesBurned: Number,
  image: String,
  category: {
    type: String,
    enum: ['ความแข็งแรง', 'คาร์ดิโอ', 'ความยืดหยุ่น', 'HIIT'],
    default: 'ความแข็งแรง',
  },
  workoutList: [
    {
      exercise: {
        type: Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    },
  ],
});

const WorkoutProgram = mongoose.model('WorkoutProgram', workoutProgramSchema, 'Program');

const workoutPlanSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  plans: [
    {
      day: {
        type: String,
        required: true,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      exercises: [
        {
          exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
          performed: {
            reps: { type: Number, default: 0 },
            seconds: { type: Number, default: 0 },
          },
          completed: { type: Boolean, default: false },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

const recentSchema = new Schema({
  calorieBurn: { type: Number, required: true },
  type: { type: String, enum: ['reps', 'time'], required: true },
  progress: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: String, required: true },
  uid: { type: String, required: true },
  exerciseId: { type: String, required: true },
});

const Recent = mongoose.model('Recent', recentSchema);

const workoutSessionExerciseSchema = new mongoose.Schema(
  {
    exercise: { type: String },
    name: String,
    type: { type: String, enum: ['reps', 'time'] },
    value: mongoose.Schema.Types.Mixed,
    order: Number,
  },
  { _id: false }
);

const workoutSessionLogSchema = new mongoose.Schema(
  {
    order: Number,
    exerciseId: String,
    name: String,
    target: {
      type: { type: String },
      value: String,
    },
    performed: {
      seconds: { type: Number, default: 0 },
      reps: { type: Number, default: 0 },
    },
    calories: { type: Number, default: 0 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    origin: {
      kind: { type: String, enum: ['program', 'daily'], required: true },
      programId: { type: String, default: null },
    },
    snapshot: {
      programName: { type: String, default: null },
      exercises: [workoutSessionExerciseSchema],
    },
    totalExercises: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
    logs: [workoutSessionLogSchema],
  },
  { timestamps: true }
);

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

app.post('/api/metrics', async (req, res) => {
  const { userId, weight, height, fatPercentage, muscleMass } = req.body;

  if (!userId || !weight || !height) {
    return res.status(400).json({ msg: 'กรุณากรอกข้อมูล userId, weight, และ height' });
  }

  try {
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(2));

    const newMetric = new BodyMetric({
      userId,
      weight,
      height,
      bmi,
      fatPercentage,
      muscleMass,
    });

    const savedMetric = await newMetric.save();
    return res.status(201).json(savedMetric);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { range } = req.query;
    let startDate;
    const today = new Date();

    switch (range) {
      case '1m':
        startDate = new Date(new Date().setMonth(today.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(new Date().setMonth(today.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(new Date().setMonth(today.getMonth() - 6));
        break;
      case '1y':
        startDate = new Date(new Date().setFullYear(today.getFullYear() - 1));
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    const query = { userId };
    if (startDate) {
      query.date = { $gte: startDate };
    }

    const metrics = await BodyMetric.find(query).sort({ date: 'asc' });
    return res.json(metrics);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

app.post('/api/workoutplan', async (req, res) => {
  try {
    const { uid, plans } = req.body;

    if (!uid || !plans) {
      return res.status(400).json({ error: 'UID and plans are required' });
    }

    const existingPlan = await WorkoutPlan.findOne({ uid });
    if (existingPlan) {
      existingPlan.plans = plans;
      existingPlan.updatedAt = new Date();
      const updatedPlan = await existingPlan.save();
      return res.json(updatedPlan);
    }

    const newPlan = new WorkoutPlan({
      uid,
      plans,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedPlan = await newPlan.save();
    return res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return res.status(500).json({ error: 'ไม่สามารถสร้างแผนการออกกำลังกายได้' });
  }
});

app.get('/api/workoutplan/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const workoutPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    if (!workoutPlan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    return res.json(workoutPlan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงแผนการออกกำลังกายได้' });
  }
});

app.post('/api/workoutplan/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { plans } = req.body;

    if (!Array.isArray(plans)) {
      return res.status(400).json({ message: 'plans ต้องเป็น array' });
    }

    for (const plan of plans) {
      if (!plan.day) {
        return res.status(400).json({ message: 'แต่ละแผนต้องระบุวันด้วย day field' });
      }

      if (!Array.isArray(plan.exercises)) {
        return res.status(400).json({ message: 'exercises ต้องเป็น array' });
      }
    }

    let workoutPlan = await WorkoutPlan.findOne({ uid });

    if (workoutPlan) {
      workoutPlan.plans = plans;
    } else {
      workoutPlan = new WorkoutPlan({ uid, plans });
    }

    await workoutPlan.save();

    const populatedPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    return res.status(200).json(populatedPlan);
  } catch (err) {
    console.error('Error saving workout plan:', err);
    return res.status(500).json({ message: err.message });
  }
});

app.delete('/api/workoutplan/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const deletedPlan = await WorkoutPlan.findOneAndDelete({ uid });
    if (!deletedPlan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    await User.findOneAndUpdate({ uid }, { workoutPlanId: null, updatedAt: new Date() });

    return res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return res.status(500).json({ error: 'ไม่สามารถลบแผนการออกกำลังกายได้' });
  }
});

app.patch('/api/workoutplan/:uid/progress', async (req, res) => {
  try {
    const { uid } = req.params;
    const { day, exerciseIndex, completed } = req.body;

    if (day === undefined || exerciseIndex === undefined || completed === undefined) {
      return res.status(400).json({ message: 'ต้องระบุ day, exerciseIndex, และ completed' });
    }

    const workoutPlan = await WorkoutPlan.findOne({ uid });
    if (!workoutPlan) return res.status(404).json({ message: 'ไม่พบ workout plan ของผู้ใช้' });

    const dayPlan = workoutPlan.plans.find((p) => p.day === day);
    if (!dayPlan) return res.status(404).json({ message: `ไม่พบข้อมูลของวัน ${day}` });

    if (exerciseIndex >= dayPlan.exercises.length || exerciseIndex < 0) {
      return res.status(400).json({ message: 'exerciseIndex ไม่ถูกต้อง' });
    }

    dayPlan.exercises[exerciseIndex].completed = completed;
    await workoutPlan.save();

    const populatedPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    return res.status(200).json(populatedPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post('/api/workoutplan/:uid/day/:day/exercise', async (req, res) => {
  try {
    const { uid, day } = req.params;
    const { exercise } = req.body;

    if (!exercise) return res.status(400).json({ message: 'ต้องระบุ exercise ID' });

    const exerciseExists = await Exercise.findById(exercise);
    if (!exerciseExists) return res.status(404).json({ message: 'ไม่พบ exercise ที่ระบุ' });

    let workoutPlan = await WorkoutPlan.findOne({ uid });
    if (!workoutPlan) {
      workoutPlan = new WorkoutPlan({
        uid,
        plans: [
          { day: 'monday', exercises: [] },
          { day: 'tuesday', exercises: [] },
          { day: 'wednesday', exercises: [] },
          { day: 'thursday', exercises: [] },
          { day: 'friday', exercises: [] },
          { day: 'saturday', exercises: [] },
          { day: 'sunday', exercises: [] },
        ],
      });
    }

    let dayPlan = workoutPlan.plans.find((p) => p.day === day);
    if (!dayPlan) {
      dayPlan = { day, exercises: [] };
      workoutPlan.plans.push(dayPlan);
    }

    dayPlan.exercises.push({ exercise, performed: {} });
    await workoutPlan.save();

    const populatedPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    return res.status(201).json(populatedPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.delete('/api/workoutplan/:uid/day/:day/exercise/:index', async (req, res) => {
  try {
    const { uid, day, index } = req.params;

    const workoutPlan = await WorkoutPlan.findOne({ uid });
    if (!workoutPlan) return res.status(404).json({ message: 'ไม่พบ workout plan ของผู้ใช้' });

    const dayPlan = workoutPlan.plans.find((p) => p.day === day);
    if (!dayPlan) return res.status(404).json({ message: `ไม่พบข้อมูลของวัน ${day}` });

    const exerciseIndex = parseInt(index, 10);
    if (Number.isNaN(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= dayPlan.exercises.length) {
      return res.status(400).json({ message: 'index ไม่ถูกต้อง' });
    }

    dayPlan.exercises.splice(exerciseIndex, 1);

    await workoutPlan.save();

    const populatedPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    return res.status(200).json(populatedPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.put('/api/workoutplan/:uid/day/:day/exercise/:index', async (req, res) => {
  try {
    const { uid, day, index } = req.params;
    const { exercise } = req.body;

    if (!exercise) return res.status(400).json({ message: 'ต้องระบุ exercise ID' });

    const exerciseExists = await Exercise.findById(exercise);
    if (!exerciseExists) return res.status(404).json({ message: 'ไม่พบ exercise ที่ระบุ' });

    const workoutPlan = await WorkoutPlan.findOne({ uid });
    if (!workoutPlan) return res.status(404).json({ message: 'ไม่พบ workout plan ของผู้ใช้' });

    const dayPlan = workoutPlan.plans.find((p) => p.day === day);
    if (!dayPlan) return res.status(404).json({ message: `ไม่พบข้อมูลของวัน ${day}` });

    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0 || i >= dayPlan.exercises.length) {
      return res.status(400).json({ message: 'index ไม่ถูกต้อง' });
    }

    const current = dayPlan.exercises[i];
    dayPlan.exercises[i] = { exercise, performed: current?.performed || {} };

    await workoutPlan.save();

    const populatedPlan = await WorkoutPlan.findOne({ uid }).populate('plans.exercises.exercise');
    return res.status(200).json(populatedPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { uid, caloriesBurned = 0, workoutsDone = 0, weeklyGoal = 3, workoutPlanId = null } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = new User({
      uid,
      caloriesBurned,
      workoutsDone,
      weeklyGoal,
      workoutPlanId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้ได้' });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    const updatedUser = await User.findOneAndUpdate({ uid }, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' });
  }
});

app.put('/api/users/:uid/stats', async (req, res) => {
  try {
    const { caloriesToAdd, workoutsToAdd } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      {
        $inc: {
          caloriesBurned: caloriesToAdd || 0,
          workoutsDone: workoutsToAdd || 0,
        },
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:uid/workoutPlan', async (req, res) => {
  try {
    const { workoutPlanId } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { workoutPlanId, updatedAt: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error updating user workout plan:', error);
    return res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' });
  }
});

app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    return res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้' });
  }
});

app.get('/api/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'ไม่พบข้อมูล Exercise ที่ระบุ' });
    }
    return res.json(exercise);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post('/api/exercises/byIds', async (req, res) => {
  try {
    const { ids } = req.body;
    const exercises = await Exercise.find({ _id: { $in: ids } });
    return res.json(exercises);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post(
  '/api/exercises',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, type, description, duration, caloriesBurned, value } = req.body;

      let imageUrl = null;
      let videoUrl = null;
      let imagePath = null;
      let videoPath = null;

      if (req.files?.image?.[0]) {
        imagePath = req.files.image[0].path;
        imageUrl = `/uploads/${req.files.image[0].filename}`;
      }

      if (req.files?.video?.[0]) {
        videoPath = req.files.video[0].path;
        videoUrl = `/uploads/${req.files.video[0].filename}`;
      }

      const exercise = new Exercise({
        name,
        type,
        description,
        duration,
        caloriesBurned: parseInt(caloriesBurned, 10) || 0,
        value: value ? JSON.parse(value) : null,
        image: imagePath,
        video: videoPath,
        imageUrl,
        videoUrl,
      });

      const newExercise = await exercise.save();
      return res.status(201).json(newExercise);
    } catch (err) {
      console.error('Error creating exercise:', err);
      return res.status(400).json({ message: err.message });
    }
  }
);

app.put(
  '/api/exercises/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, type, description, duration, caloriesBurned, value } = req.body;

      const existingExercise = await Exercise.findById(req.params.id);
      if (!existingExercise) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลการฝึก' });
      }

      const existing = await Exercise.findById(req.params.id);
      const updateData = {
        name: name ?? existing?.name,
        type: type ?? existing?.type,
        description: description ?? existing?.description,
        duration: duration !== undefined ? Number(duration) : existing?.duration,
        caloriesBurned:
          caloriesBurned !== undefined ? Number(caloriesBurned) : existing?.caloriesBurned,
        value: value ? JSON.parse(value) : existing?.value,
      };

      if (req.files?.image?.[0]) {
        updateData.image = req.files.image[0].path;
        updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;

        if (existingExercise.image && fs.existsSync(existingExercise.image)) {
          fs.unlinkSync(existingExercise.image);
        }
      }

      if (req.files?.video?.[0]) {
        updateData.video = req.files.video[0].path;
        updateData.videoUrl = `/uploads/${req.files.video[0].filename}`;

        if (existingExercise.video && fs.existsSync(existingExercise.video)) {
          fs.unlinkSync(existingExercise.video);
        }
      }

      const exercise = await Exercise.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return res.json(exercise);
    } catch (err) {
      console.error('Error updating exercise:', err);
      return res.status(400).json({ message: err.message });
    }
  }
);

app.delete('/api/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการฝึก' });
    }

    if (exercise.image && fs.existsSync(exercise.image)) {
      fs.unlinkSync(exercise.image);
    }
    if (exercise.video && fs.existsSync(exercise.video)) {
      fs.unlinkSync(exercise.video);
    }

    await Exercise.findByIdAndDelete(req.params.id);
    return res.json({ message: 'ลบข้อมูลเรียบร้อย' });
  } catch (err) {
    console.error('Error deleting exercise:', err);
    return res.status(500).json({ message: err.message });
  }
});

app.get('/api/workout_programs', async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};
    if (category && category !== 'ทั้งหมด') {
      filter.category = category;
    }

    const programs = await WorkoutProgram.find(filter)
      .populate({
        path: 'workoutList.exercise',
      })
      .lean();

    const formattedPrograms = programs.map((program) => ({
      ...program,
      workoutList: program.workoutList.map((item) => ({
        _id: item.exercise?._id,
        name: item.exercise?.name,
        image: item.exercise?.image,
        imageUrl: item.exercise?.imageUrl,
        type: item.exercise?.type,
        value: item.exercise?.value,
      })),
    }));

    return res.json(formattedPrograms);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/workout_programs/:id', async (req, res) => {
  try {
    const program = await WorkoutProgram.findById(req.params.id).populate({
      path: 'workoutList.exercise',
      model: 'Exercise',
    });

    if (!program) {
      return res.status(404).json({ error: 'Workout program not found' });
    }

    const transformedProgram = {
      ...program.toObject(),
      workoutList: program.workoutList.map((workout) => ({
        _id: workout._id,
        ...workout.exercise.toObject(),
        originalExerciseId: workout.exercise._id,
      })),
    };

    return res.json(transformedProgram);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/workout_programs', upload.single('image'), async (req, res) => {
  try {
    const newProgram = new WorkoutProgram({
      name: req.body.name,
      description: req.body.description,
      duration: req.body.duration,
      caloriesBurned: req.body.caloriesBurned,
      category: req.body.category || 'ความแข็งแรง',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      workoutList: req.body.workoutList ? JSON.parse(req.body.workoutList) : [],
    });

    const savedProgram = await newProgram.save();
    return res.status(201).json(savedProgram);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/workout_programs/:id/add-workout', async (req, res) => {
  try {
    const programId = req.params.id;
    const newWorkout = req.body.workout;

    const updatedProgram = await WorkoutProgram.findByIdAndUpdate(
      programId,
      { $push: { workoutList: newWorkout } },
      { new: true }
    ).populate({
      path: 'workoutList.exercise',
      select: 'name image imageUrl type value',
    });

    return res.json(updatedProgram);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.put('/api/workout_programs/:id', upload.single('image'), async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      duration: req.body.duration,
      caloriesBurned: req.body.caloriesBurned,
      category: req.body.category || 'ความแข็งแรง',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      workoutList: req.body.workoutList ? JSON.parse(req.body.workoutList) : [],
    };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProgram = await WorkoutProgram.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProgram) {
      return res.status(404).json({ error: 'Workout program not found' });
    }

    return res.json(updatedProgram);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = ['ทั้งหมด', 'ความแข็งแรง', 'คาร์ดิโอ', 'ความยืดหยุ่น', 'HIIT'];
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/workout_programs/:id/category', async (req, res) => {
  try {
    const { category } = req.body;

    if (!['ความแข็งแรง', 'คาร์ดิโอ', 'ความยืดหยุ่น', 'HIIT'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updatedProgram = await WorkoutProgram.findByIdAndUpdate(
      req.params.id,
      { category },
      { new: true, runValidators: true }
    );

    if (!updatedProgram) {
      return res.status(404).json({ error: 'Workout program not found' });
    }

    return res.json(updatedProgram);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/workout_programs/:id', async (req, res) => {
  try {
    const program = await WorkoutProgram.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ error: 'Workout program not found' });
    }
    return res.json({ message: 'ลบโปรแกรมเรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/recent', async (req, res) => {
  try {
    const recent = new Recent(req.body);
    await recent.save();
    return res.status(201).json(recent);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/recent', async (req, res) => {
  try {
    const recents = await Recent.find();
    return res.json(recents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/recent/user/:uid', async (req, res) => {
  try {
    const recents = await Recent.find({ uid: req.params.uid });
    return res.json(recents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/recent/:id', async (req, res) => {
  try {
    const updated = await Recent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/recent/:id', async (req, res) => {
  try {
    await Recent.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/workout-plans/templates/:level', async (req, res) => {
  try {
    const { level } = req.params;

    const templatePlans = {
      beginner: [
        {
          _id: 'template_beginner_1',
          name: 'แผนเริ่มต้นสำหรับมือใหม่',
          level: 'beginner',
          description: 'แผนการออกกำลังกายที่เหมาะสำหรับผู้เริ่มต้น',
          plans: [
            { day: 'sunday', exercises: [] },
            {
              day: 'monday',
              exercises: [
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
                { exercise: '687605360f6991e1457e6728', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
              ],
            },
            { day: 'tuesday', exercises: [] },
            {
              day: 'wednesday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
              ],
            },
            { day: 'thursday', exercises: [] },
            {
              day: 'friday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
              ],
            },
            { day: 'saturday', exercises: [] },
          ],
        },
      ],
      normal: [
        {
          _id: 'template_normal_1',
          name: 'แผนกลางสำหรับระดับปานกลาง',
          level: 'normal',
          description: 'แผนการออกกำลังกายระดับกลางที่เน้นความสมดุล',
          plans: [
            { day: 'sunday', exercises: [] },
            {
              day: 'monday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
                { exercise: '687604fa0f6991e1457e6726', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
              ],
            },
            {
              day: 'tuesday',
              exercises: [
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
                { exercise: '687605360f6991e1457e6728', performed: { reps: 0 } },
              ],
            },
            { day: 'wednesday', exercises: [] },
            {
              day: 'thursday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
              ],
            },
            {
              day: 'friday',
              exercises: [
                { exercise: '687604fa0f6991e1457e6726', performed: { reps: 0 } },
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
              ],
            },
            { day: 'saturday', exercises: [] },
          ],
        },
      ],
      professional: [
        {
          _id: 'template_professional_1',
          name: 'แผนสำหรับระดับสูง',
          level: 'professional',
          description: 'แผนการออกกำลังกายที่ท้าทายสำหรับผู้มีประสบการณ์',
          plans: [
            {
              day: 'sunday',
              exercises: [{ exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } }],
            },
            {
              day: 'monday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
                { exercise: '687604fa0f6991e1457e6726', performed: { reps: 0 } },
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
              ],
            },
            {
              day: 'tuesday',
              exercises: [
                { exercise: '687605360f6991e1457e6728', performed: { reps: 0 } },
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
              ],
            },
            {
              day: 'wednesday',
              exercises: [
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
                { exercise: '687604fa0f6991e1457e6726', performed: { reps: 0 } },
              ],
            },
            {
              day: 'thursday',
              exercises: [
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
                { exercise: '687605360f6991e1457e6728', performed: { reps: 0 } },
              ],
            },
            {
              day: 'friday',
              exercises: [
                { exercise: '687604fa0f6991e1457e6726', performed: { reps: 0 } },
                { exercise: '687602db0f6991e1457e6722', performed: { seconds: 0 } },
                { exercise: '6875fadb0f6991e1457e6711', performed: { reps: 0 } },
              ],
            },
            {
              day: 'saturday',
              exercises: [
                { exercise: '687604cb0f6991e1457e6725', performed: { reps: 0 } },
                { exercise: '687605170f6991e1457e6727', performed: { reps: 0 } },
              ],
            },
          ],
        },
      ],
    };

    const plans = templatePlans[level] || [];
    return res.json(plans);
  } catch (error) {
    console.error('Error fetching workout plan templates:', error);
    return res.status(500).json({ error: 'ไม่สามารถดึงแผนการออกกำลังกายได้' });
  }
});

app.post('/api/workout_sessions/start', async (req, res) => {
  try {
    let { uid, origin, snapshot, totalExercises } = req.body || {};
    if (!uid) return res.status(400).json({ error: 'uid is required' });
    if (!origin?.kind) return res.status(400).json({ error: 'origin.kind is required' });

    if (typeof snapshot === 'string') {
      try {
        snapshot = JSON.parse(snapshot);
      } catch (err) {
        snapshot = {};
      }
    }
    if (snapshot && typeof snapshot.exercises === 'string') {
      try {
        snapshot.exercises = JSON.parse(snapshot.exercises);
      } catch (err) {
        snapshot.exercises = [];
      }
    }
    if (!Array.isArray(snapshot?.exercises)) snapshot = { ...(snapshot || {}), exercises: [] };

    const doc = await WorkoutSession.create({
      uid,
      origin,
      snapshot,
      totalExercises: Number(totalExercises) || snapshot.exercises.length || 0,
    });

    return res.status(201).json(doc);
  } catch (e) {
    console.error('start session error:', e);
    return res.status(500).json({ error: 'failed to start session' });
  }
});

app.post('/api/workout_sessions/:id/log-exercise', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const update = {
      $push: {
        logs: {
          order: Number(payload.order ?? 0),
          exerciseId: String(payload.exerciseId ?? ''),
          name: payload.name || '',
          target: {
            type: payload.target?.type || null,
            value: String(payload.target?.value ?? ''),
          },
          performed: {
            seconds: Number(payload.performed?.seconds || 0),
            reps: Number(payload.performed?.reps || 0),
          },
          calories: Number(payload.calories || 0),
        },
      },
    };

    const sess = await WorkoutSession.findByIdAndUpdate(id, update, { new: true });
    if (!sess) return res.status(404).json({ error: 'session not found' });

    return res.json({ ok: true });
  } catch (e) {
    console.error('log-exercise error:', e);
    return res.status(500).json({ error: 'failed to log exercise' });
  }
});

app.patch('/api/workout_sessions/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;

    const sess = await WorkoutSession.findByIdAndUpdate(id, { finishedAt: new Date() }, { new: true });
    if (!sess) return res.status(404).json({ error: 'session not found' });

    const totals = sess.logs.reduce(
      (acc, l) => {
        acc.seconds += Number(l?.performed?.seconds || 0);
        acc.reps += Number(l?.performed?.reps || 0);
        acc.calories += Number(l?.calories || 0);
        return acc;
      },
      { seconds: 0, reps: 0, calories: 0 }
    );

    try {
      await User.findOneAndUpdate(
        { uid: sess.uid },
        {
          $inc: {
            caloriesBurned: totals.calories,
            workoutsDone: 1,
          },
          updatedAt: new Date(),
        },
        { new: true }
      );
    } catch (e) {
      console.warn('update user stats warn:', e?.message);
    }

    return res.json({
      sessionId: sess._id,
      programName: sess.snapshot?.programName || null,
      totalExercises: sess.totalExercises || sess.snapshot?.exercises?.length || 0,
      doneExercises: sess.logs.length,
      totals,
      finishedAt: sess.finishedAt,
    });
  } catch (e) {
    console.error('finish session error:', e);
    return res.status(500).json({ error: 'failed to finish session' });
  }
});

app.get('/api/__summary_internal/program/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'uid is required' });

    const latest = await WorkoutSession.findOne({ uid, 'origin.kind': 'program' })
      .sort({ finishedAt: -1, startedAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ error: 'no finished session found for this uid' });
    }

    const totals =
      latest.logs?.reduce(
        (acc, l) => {
          acc.seconds += Number(l?.performed?.seconds || 0);
          acc.reps += Number(l?.performed?.reps || 0);
          acc.calories += Number(l?.calories || 0);
          return acc;
        },
        { seconds: 0, reps: 0, calories: 0 }
      ) || { seconds: 0, reps: 0, calories: 0 };

    return res.json({
      uid,
      sessionId: String(latest._id),
      programName: latest.snapshot?.programName || null,
      totalExercises: latest.totalExercises || latest.snapshot?.exercises?.length || 0,
      doneExercises: latest.logs?.length || 0,
      totals,
      logs: latest.logs || [],
      startedAt: latest.startedAt,
      finishedAt: latest.finishedAt,
    });
  } catch (e) {
    console.error('summary endpoint error:', e);
    return res.status(500).json({ error: 'failed to build summary' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

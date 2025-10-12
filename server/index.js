import express from "express";
import cors from "cors";
import { getDb } from "./mongo.js";
import { normalizeExercise, normalizeProgram, normalizeFeedback } from "./transformers.js";

const PORT = process.env.PORT || process.env.API_PORT || 4000;

function collectionExists(db, name) {
  return db
    .listCollections({ name }, { nameOnly: true })
    .toArray()
    .then((collections) => collections.length > 0)
    .catch(() => false);
}

async function fetchExercises(db) {
  const exists = await collectionExists(db, "exercises");
  if (!exists) return [];
  const items = await db.collection("exercises").find({}).toArray();
  return items.map((doc) => normalizeExercise(doc));
}

async function fetchUsers(db) {
  const exists = await collectionExists(db, "users");
  if (!exists) return [];
  const items = await db.collection("users").find({}).toArray();
  return items.map((doc) => ({ id: doc._id?.toString?.(), ...doc }));
}

async function countCollection(db, name) {
  const exists = await collectionExists(db, name);
  if (!exists) return 0;
  try {
    // countDocuments gives accurate count; fallback to estimatedDocumentCount if needed
    return await db.collection(name).countDocuments();
  } catch (e) {
    return await db.collection(name).estimatedDocumentCount();
  }
}

async function fetchPrograms(db, exercises) {
  const exists = await collectionExists(db, "Program");
  if (!exists) return [];

  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  const rawPrograms = await db
    .collection("Program")
    .aggregate([
      {
        $lookup: {
          from: "exercises",
          localField: "workoutList.exercise",
          foreignField: "_id",
          as: "exerciseDetails",
        },
      },
    ])
    .toArray();

  return rawPrograms.map((program) => {
    const detailsMap = new Map(
      program.exerciseDetails.map((item) => [item._id?.toString?.(), normalizeExercise(item)])
    );
    const combinedMap = new Map([...exerciseMap.entries(), ...detailsMap.entries()]);
    return normalizeProgram(program, combinedMap);
  });
}

async function fetchFeedback(db, programs, exercises) {
  const programMap = new Map(programs.map((item) => [item.id, item]));
  const exerciseMap = new Map(exercises.map((item) => [item.id, item]));

  const candidates = ["feedback", "Feedback", "programFeedback", "exerciseFeedback"];
  const feedbackDocs = [];

  for (const name of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await collectionExists(db, name)) {
      // eslint-disable-next-line no-await-in-loop
      const docs = await db.collection(name).find({}).toArray();
      feedbackDocs.push(...docs);
    }
  }

  if (feedbackDocs.length === 0) return [];

  return feedbackDocs
    .map((doc) => normalizeFeedback(doc, programMap, exerciseMap))
    .filter(Boolean);
}

export async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/exercises", async (_req, res) => {
    try {
      const db = await getDb();
      const exercises = await fetchExercises(db);
      res.json(exercises);
    } catch (error) {
      console.error("[api] failed to load exercises", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลท่าฝึกได้" });
    }
  });

  app.get("/api/users", async (_req, res) => {
    try {
      const db = await getDb();
      const users = await fetchUsers(db);
      res.json(users);
    } catch (error) {
      console.error("[api] failed to load users", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้ใช้งานได้" });
    }
  });

  app.get("/api/programs", async (_req, res) => {
    try {
      const db = await getDb();
      const exercises = await fetchExercises(db);
      const programs = await fetchPrograms(db, exercises);
      res.json(programs);
    } catch (error) {
      console.error("[api] failed to load programs", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลโปรแกรมได้" });
    }
  });

  app.get("/api/feedback", async (_req, res) => {
    try {
      const db = await getDb();
      const exercises = await fetchExercises(db);
      const programs = await fetchPrograms(db, exercises);
      const feedback = await fetchFeedback(db, programs, exercises);
      res.json(feedback);
    } catch (error) {
      console.error("[api] failed to load feedback", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลความคิดเห็นได้" });
    }
  });

  // Return counts for Overview dashboard (programs, exercises, users)
  app.get("/api/counts", async (_req, res) => {
    try {
      const db = await getDb();
      const [programsCount, exercisesCount, usersCount] = await Promise.all([
        countCollection(db, "Program"),
        countCollection(db, "exercises"),
        countCollection(db, "users"),
      ]);

      res.json({ programs: programsCount, exercises: exercisesCount, users: usersCount });
    } catch (error) {
      console.error("[api] failed to load counts", error);
      res.status(500).json({ message: "ไม่สามารถดึงสถิติได้" });
    }
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer()
    .then((app) => {
      app.listen(PORT, () => {
        console.log(`API server listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start API server", error);
      process.exit(1);
    });
}

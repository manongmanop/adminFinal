import express from "express";
import cors from "cors";
import { pathToFileURL, fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";
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
      // Exclude soft-deleted items
      {
        $match: {
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false },
          ],
        },
      },
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

  // Configure uploads directory and static hosting
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const uploadDir = path.resolve(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      const base = path.basename(file.originalname || "file", ext).replace(/[^a-zA-Z0-9-_]/g, "_");
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });
  const upload = multer({ storage });
  // Serve uploads from the primary uploads directory
  app.use("/uploads", express.static(uploadDir));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Upload single file: returns { url }
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      const url = `/uploads/${req.file.filename}`;
      res.status(201).json({ url, filename: req.file.filename });
    } catch (e) {
      res.status(500).json({ message: "failed to upload" });
    }
  });
  // ---- Exercises: LIST ----
  app.get("/api/exercises", async (_req, res) => {
    try {
      const db = await getDb();
      const items = await db
        .collection("exercises")
        .find({
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        })
        .toArray();
      res.json(items.map((doc) => normalizeExercise(doc)));
    } catch (err) {
      console.error("[api] list exercises failed", err);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลท่าฝึกได้" });
    }
  });

  // ---- Exercises: GET by id ----
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const db = await getDb();
      let _id;
      try { _id = new ObjectId(req.params.id); }
      catch { return res.status(400).json({ message: "invalid exercise id" }); }

      const doc = await db.collection("exercises").findOne({
        _id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      });
      if (!doc) return res.status(404).json({ message: "exercise not found" });
      res.json(normalizeExercise(doc));
    } catch (err) {
      console.error("[api] get exercise failed", err);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลท่าฝึกได้" });
    }
  });

  // ---- Exercises: CREATE ----
  app.post("/api/exercises", async (req, res) => {
    try {
      const db = await getDb();
      const body = req.body || {};

      // แปลง/ปกป้องข้อมูลเข้า
      const toStr = (v) => (v == null ? "" : String(v));
      const toNum = (v, d = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
      };
      const toStrArr = (arr) =>
        Array.isArray(arr) ? arr.map((x) => toStr(x)).filter(Boolean) : [];

      const doc = {
        name: toStr(body.name),
        description: toStr(body.description),
        tips: toStr(body.tips),
        type: body.type === "time" ? "time" : "reps",
        value: body.type === "time" ? null : toNum(body.value, 10),
        duration: body.type === "time" ? toNum(body.duration, 30) : null,
        caloriesBurned: toNum(body.caloriesBurned, 0),
        video: toStr(body.video),
        image: toStr(body.image),
        muscles: toStrArr(body.muscles),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const r = await db.collection("exercises").insertOne(doc);
      const saved = await db.collection("exercises").findOne({ _id: r.insertedId });
      return res.status(201).json(normalizeExercise(saved));
    } catch (err) {
      console.error("[api] create exercise failed", err);
      return res.status(500).json({ message: "failed to create exercise" });
    }
  });

  // ---- Exercises: UPDATE ----
  app.put("/api/exercises/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      let _id;
      try {
        _id = new ObjectId(id);
      } catch {
        return res.status(400).json({ message: "invalid exercise id" });
      }

      const body = req.body || {};
      const toStr = (v) => (v == null ? "" : String(v));
      const toNum = (v, d = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
      };
      const toStrArr = (arr) =>
        Array.isArray(arr) ? arr.map((x) => toStr(x)).filter(Boolean) : [];

      const update = {
        $set: {
          name: toStr(body.name),
          description: toStr(body.description),
          tips: toStr(body.tips),
          type: body.type === "time" ? "time" : "reps",
          value: body.type === "time" ? null : toNum(body.value, 10),
          duration: body.type === "time" ? toNum(body.duration, 30) : null,
          caloriesBurned: toNum(body.caloriesBurned, 0),
          video: toStr(body.video),
          image: toStr(body.image),
          muscles: toStrArr(body.muscles),
          updatedAt: new Date(),
        },
      };

      await db.collection("exercises").updateOne({ _id }, update);
      const saved = await db.collection("exercises").findOne({ _id });
      return res.json(normalizeExercise(saved));
    } catch (err) {
      console.error("[api] update exercise failed", err);
      return res.status(500).json({ message: "failed to update exercise" });
    }
  });

  // ---- Exercises: DELETE (soft delete or hard delete เลือกอย่างใดอย่างหนึ่ง) ----
  // แบบลบจริง:
  // app.delete("/api/exercises/:id", async (req, res) => {
  //   try {
  //     const db = await getDb();
  //     const { id } = req.params;
  //     let _id;
  //     try {
  //       _id = new ObjectId(id);
  //     } catch {
  //       return res.status(400).json({ message: "invalid exercise id" });
  //     }

  //     await db.collection("exercises").deleteOne({ _id });
  //     return res.json({ ok: true });
  //   } catch (err) {
  //     console.error("[api] delete exercise failed", err);
  //     return res.status(500).json({ message: "failed to delete exercise" });
  //   }
  // });

  // soft delete:
  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      let _id; try { _id = new ObjectId(id); } catch { return res.status(400).json({ message: "invalid exercise id" }); }
      await db.collection("exercises").updateOne({ _id }, { $set: { isDeleted: true, deletedAt: new Date() } });
      return res.json({ ok: true, softDeleted: true });
    } catch (err) {
      console.error("[api] soft delete exercise failed", err);
      return res.status(500).json({ message: "failed to delete exercise" });
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

  // Create a new program
  app.post("/api/programs", async (req, res) => {
    try {
      const db = await getDb();
      const input = req.body || {};

      const toStringOrEmpty = (v) => (typeof v === "string" ? v : (v == null ? "" : String(v)));
      const toNumberOrZero = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const toStringArray = (arr) =>
        Array.isArray(arr) ? arr.map((x) => (x?.toString?.() || x)).filter(Boolean) : [];

      const workoutList = Array.isArray(input.workoutList)
        ? input.workoutList.map((w) => {
          let exerciseRef = w.exercise ?? w.exerciseId;
          if (typeof exerciseRef === "string" && /^[a-f0-9]{24}$/i.test(exerciseRef)) {
            try { exerciseRef = new ObjectId(exerciseRef); } catch { /* ignore */ }
          }
          return {
            id: toStringOrEmpty(w.id),
            exercise: exerciseRef,
            name: toStringOrEmpty(w.name),
            description: toStringOrEmpty(w.description),
            muscles: toStringArray(w.muscles),
            type: w.type === "time" ? "time" : "reps",
            value: w.type === "time" ? "" : toStringOrEmpty(w.value ?? ""),
            duration: w.type === "time" ? toStringOrEmpty(w.duration ?? "") : "",
            image: toStringOrEmpty(w.image),
            video: toStringOrEmpty(w.video),
          };
        })
        : [];

      const doc = {
        name: toStringOrEmpty(input.name),
        description: toStringOrEmpty(input.description),
        duration: toStringOrEmpty(input.duration),
        caloriesBurned: toNumberOrZero(input.caloriesBurned),
        image: toStringOrEmpty(input.image),
        category: toStringOrEmpty(input.category),
        DataFeedback: input.DataFeedback || null,
        workoutList,
      };

      const result = await db.collection("Program").insertOne(doc);
      const saved = await db.collection("Program").findOne({ _id: result.insertedId });
      res.status(201).json(saved ? normalizeProgram(saved, new Map()) : { id: result.insertedId.toString() });
    } catch (error) {
      console.error("[api] failed to create program", error);
      res.status(500).json({ message: "failed to create program" });
    }
  });

  // Update a program
  app.put("/api/programs/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      let _id;
      try {
        _id = new ObjectId(id);
      } catch {
        return res.status(400).json({ message: "invalid program id" });
      }

      const input = req.body || {};
      const toStringOrEmpty = (v) => (typeof v === "string" ? v : (v == null ? "" : String(v)));
      const toNumberOrZero = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const toStringArray = (arr) =>
        Array.isArray(arr) ? arr.map((x) => (x?.toString?.() || x)).filter(Boolean) : [];

      const workoutList = Array.isArray(input.workoutList)
        ? input.workoutList.map((w) => {
          let exerciseRef = w.exercise ?? w.exerciseId;
          if (typeof exerciseRef === "string" && /^[a-f0-9]{24}$/i.test(exerciseRef)) {
            try { exerciseRef = new ObjectId(exerciseRef); } catch { /* ignore */ }
          }
          return {
            id: toStringOrEmpty(w.id),
            exercise: exerciseRef,
            name: toStringOrEmpty(w.name),
            description: toStringOrEmpty(w.description),
            muscles: toStringArray(w.muscles),
            type: w.type === "time" ? "time" : "reps",
            value: w.type === "time" ? "" : toStringOrEmpty(w.value ?? ""),
            duration: w.type === "time" ? toStringOrEmpty(w.duration ?? "") : "",
            image: toStringOrEmpty(w.image),
            video: toStringOrEmpty(w.video),
          };
        })
        : [];

      const update = {
        $set: {
          name: toStringOrEmpty(input.name),
          description: toStringOrEmpty(input.description),
          duration: toStringOrEmpty(input.duration),
          caloriesBurned: toNumberOrZero(input.caloriesBurned),
          image: toStringOrEmpty(input.image),
          category: toStringOrEmpty(input.category),
          DataFeedback: input.DataFeedback !== undefined ? input.DataFeedback : undefined,
          workoutList,
        },
      };

      // Clean up undefined fields in update
      if (update.$set.DataFeedback === undefined) delete update.$set.DataFeedback;

      await db.collection("Program").updateOne({ _id }, update);
      const saved = await db.collection("Program").findOne({ _id });
      res.json(saved ? normalizeProgram(saved, new Map()) : { id });
    } catch (error) {
      console.error("[api] failed to update program", error);
      res.status(500).json({ message: "failed to update program" });
    }
  });

  // Soft delete a program
  app.delete("/api/programs/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      let _id;
      try {
        _id = new ObjectId(id);
      } catch {
        return res.status(400).json({ message: "invalid program id" });
      }

      // Mark as soft-deleted instead of removing
      await db.collection("Program").updateOne(
        { _id },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
      res.json({ ok: true, softDeleted: true });
    } catch (error) {
      console.error("[api] failed to delete program", error);
      res.status(500).json({ message: "failed to delete program" });
    }
  });

  app.get("/api/programs/feedback", async (_req, res) => {
    try {
      const db = await getDb();
      const docs = await db.collection("Program")
        .find(
          { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
          { projection: { name: 1, image: 1, category: 1, DataFeedback: 1 } }
        )
        .toArray();

      const out = docs.map((p) => ({
        id: p._id?.toString?.(),
        targetType: "program",
        targetName: p.name || "",
        imageUrl: p.image || null,
        sentimentData: p.DataFeedback || { easy: 0, medium: 0, hard: 0 },
      }));

      res.json(out);
    } catch (e) {
      console.error("[api] programs feedback failed", e);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูล DataFeedback ได้" });
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
const BASE = "/api/exercises";



// Ensure this file runs as the entry point on all platforms (incl. Windows)
const isMainModule = (() => {
  try {
    const arg = process.argv[1] || "";
    return import.meta.url === pathToFileURL(arg).href;
  } catch {
    return false;
  }
})();

if (isMainModule) {
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

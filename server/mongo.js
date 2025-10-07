import { MongoClient } from "mongodb";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/fitness_app";

let client;
let database;

function resolveDatabaseName(uri) {
  if (!uri) return "fitness_app";
  const sanitized = uri.split("?")[0];
  const segments = sanitized.split("/");
  const candidate = segments[segments.length - 1];
  return candidate && !candidate.includes(":") ? candidate : "fitness_app";
}

export async function getDb() {
  if (database) return database;

  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = process.env.MONGODB_DB || resolveDatabaseName(uri);

  client = new MongoClient(uri, {
    maxPoolSize: 10,
  });

  await client.connect();
  database = client.db(dbName);
  return database;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

process.on("SIGINT", async () => {
  await closeDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDb();
  process.exit(0);
});

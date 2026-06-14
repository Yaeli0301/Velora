import { MongoClient, type Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ?? process.env.velora_MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "velora";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  const client = new MongoClient(uri);
  return client.connect();
}

const clientPromise =
  global._mongoClientPromise ?? (uri ? createClientPromise() : undefined);

if (process.env.NODE_ENV !== "production" && clientPromise) {
  global._mongoClientPromise = clientPromise;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("[mongodb] connection failed", error);
    return null;
  }
}

export default clientPromise;

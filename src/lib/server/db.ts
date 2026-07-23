import { MongoClient, type Db } from "mongodb";

function mongoUrl(): string {
  const url =
    process.env.MONGO_URL ??
    process.env.MONGODB_URI ??
    process.env.MONGO_URI ??
    process.env.DB_URI;
  if (!url) throw new Error("MONGO_URL manquant : voir SETUP-MONGODB.md");
  return url;
}

// Cache global : évite d'ouvrir une connexion par invocation serverless (et par rechargement HMR en dev).
const globalForMongo = globalThis as unknown as { mongoClientPromise?: Promise<MongoClient> };

function clientPromise(): Promise<MongoClient> {
  globalForMongo.mongoClientPromise ??= new MongoClient(mongoUrl()).connect();
  return globalForMongo.mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  return (await clientPromise()).db(process.env.DB_NAME ?? "test_database");
}

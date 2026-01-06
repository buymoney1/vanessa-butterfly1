// lib/mongodb.ts
import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('لطفاً DATABASE_URL را در .env.local تنظیم کنید');
}

const uri = process.env.DATABASE_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // در حالت development، یک global client بساز
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // در حالت production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getMongoClient() {
  return await clientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db();
}

export { ObjectId };
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
const getDB = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.mongo_db_name);

  return db;
};

export const GET = async () => {
  const db = await getDB();
  const collections = db.collection(`${process.env.mongo_collec}`);
  const docs = await collections.find().toArray();

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST = async (req: Request) => {
  const db = await getDB();
  const { id } = await req.json();
  const collections = db.collection(`${process.env.mongo_collec}`);

  const doc = await collections.findOne(ObjectId.createFromHexString(id));
  return new Response(JSON.stringify(doc), {
    headers: { "Content-Type": "application/json" },
  });
};

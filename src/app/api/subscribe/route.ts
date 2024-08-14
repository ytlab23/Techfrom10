import { MongoClient, Db, Collection } from "mongodb";
import clientPromise from "@/lib/db";

interface Subscriber {
  email: string;
}

const getCollection = async (): Promise<Collection<Subscriber>> => {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db(process.env.mongo_db_name as string);
  return db.collection<Subscriber>("subscribers");
};

const checkDuplicate = async (
  collection: Collection<Subscriber>,
  email: string
): Promise<boolean> => {
  const document = await collection.findOne({ email });
  return !!document;
};

interface RequestBody {
  email: string;
}

export const POST = async (req: Request): Promise<Response> => {
  const { email }: RequestBody = await req.json();

  const collection = await getCollection();
  const exists = await checkDuplicate(collection, email);

  if (exists) {
    return new Response("Email Already Subscribed", { status: 409 });
  } else {
    await collection.insertOne({ email });
    return new Response("Subscription Successful", { status: 201 });
  }
};

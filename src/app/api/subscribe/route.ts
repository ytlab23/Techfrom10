import { MongoClient, Db, Collection } from "mongodb";
import clientPromise from "@/lib/db";

interface Subscriber {
  email: string;
}
interface RequestBody {
  email: string;
  unsubscribe: boolean;
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

const unsubscription = async (email: string): Promise<Response> => {
  const collection = await getCollection();
  const exists = await checkDuplicate(collection, email);
  if (exists) {
    await collection.deleteOne({ email });
    return new Response("unsubscription Successful", { status: 200 });
  } else {
    return new Response("you are not subscribed", { status: 404 });
  }
};
export const POST = async (req: Request): Promise<Response> => {
  const { email, unsubscribe }: RequestBody = await req.json();

  if (unsubscribe) return await unsubscription(email);

  const collection = await getCollection();
  const exists = await checkDuplicate(collection, email);

  if (exists) {
    return new Response("Email Already Subscribed", { status: 409 });
  } else {
    await collection.insertOne({ email });
    return new Response("Subscription Successful", { status: 201 });
  }
};

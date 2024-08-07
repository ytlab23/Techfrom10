import clientPromise from "@/lib/db";
export const GET = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.mongo_db_name);
  const collections = db.collection(`${process.env.mongo_collec}`);
  const docs = await collections.find().toArray();

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
};

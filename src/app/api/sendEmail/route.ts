import { resend } from "@/lib/resend";
import Newsletter from "@/components/emails/newsletter";
import { MongoClient, Db } from "mongodb";
import clientPromise from "@/lib/db";

interface Subscriber {
  email: string;
}

const BATCH_SIZE = 100;

const sendMail = async (subscribers: Subscriber[]) => {
  const newsletterContent = await Newsletter();

  const emailBatches = [];
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emailData = batch.map((subscriber) => ({
      from: "newsletter@techfrom10.com",
      to: subscriber.email,
      subject: "Top Tech updates this week",
      react: newsletterContent,
      headers: {
        "List-Unsubscribe": "https://techfrom10.com/unsubscribe",
      },
    }));
    emailBatches.push(emailData);
  }

  for (const batch of emailBatches) {
    await resend.batch.send(batch);
  }
};

const getSubscribers = async () => {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db(process.env.mongo_db_name as string);
  const collection = db.collection<Subscriber>("subscribers");
  return await collection.find().toArray();
};

export const GET = async (req: Request) => {
  try {
    const subscribers = await getSubscribers();
    await sendMail(subscribers);
    return new Response("Emails sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response("Error sending emails", { status: 500 });
  }
};

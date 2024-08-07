import { MongoClient, Db } from "mongodb";

const uri = process.env.mongo_uri as string;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

client = new MongoClient(uri);
clientPromise = client.connect();
export default clientPromise;

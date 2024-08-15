import clientPromise from "@/lib/db";
import getS3Client from "@/lib/s3";
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
export const maxDuration = 60;
interface NewsContent {
  title: string[];
  headline: string[];
  summary: string[];
  source: string[];
  tag: string[];
  time: string[];
  url: string;
}

const prompt = `
Write me 10 tech news from the last 24 hours.

Include the following:
A Overall title for all 10 news

A Headline (rephrase it a bit with a simple grammar)
A summary of minimum 50 words, maximum 100. (simple grammar). Minimum 50 words is essential
A link to the source
A tag for the news (e.g. AI, Cybersecurity, etc.)
How many hours ago the news is from (circa)

Example: 
Title: "",
Headline: "",
Summary: ""
source: <Link to news>
Tag: ""
Time: 12 hours ago

Tags collection:
AI
Space
Mobile
Videogames
Biotechnology
Robotics
Nanotechnology
Social Media
Cybersecurity
Gadgets
Software
Startups
Reviews
Coding
Hardware
Innovations
Tutorials

Act Like a api. Include emojis in summary. This data is being dispayed in website so dont include ** or Wrap link inside text just follow the above format. Also only one tag for each and try to use repeated tags. Make sure the Title is catchy and emoji
`;
const updateS3 = async (fileName: string, buffer: any) => {
  const s3Client = getS3Client();

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ACL: "public-read" as ObjectCannedACL,
  };
  const command = new PutObjectCommand(params);
  const result = await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
const getDB = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.mongo_db_name);

  return db;
};
const updateDB = async (
  content: NewsContent,
  image: string,
  formattedDate: string
) => {
  const db = await getDB();
  const collections = db.collection(`${process.env.mongo_collec}`);
  const now = new Date();
  const ttlInSeconds = 5 * 24 * 60 * 60;
  const expireAt = new Date(now.getTime() + ttlInSeconds * 1000);
  const data = {
    title: content.title[0],
    headlines: content.headline,
    summary: content.summary,
    source: content.source,
    hashtags: content.tag,
    published: content.time,
    imgUrl: image,
    date: formattedDate,
    expireAt: expireAt,
  };

  const doc = await collections.insertOne(data);
  return doc;
};
const formatData = async (content: string): Promise<NewsContent> => {
  const sections = content.split("\n\n");
  const result: Partial<NewsContent> = {};

  sections.forEach((section) => {
    const lines = section.split("\n");
    lines.forEach((line) => {
      const [rawKey, value] = line.split(": ");
      const key = rawKey.toLowerCase();
      if (!(key in result)) (result as any)[key] = [];
      (result as any)[key].push(value.replace(/^"|"$/g, ""));
    });
  });
  if (result.tag) {
    result.tag = result.tag.map((t) => t.toLowerCase());
  }
  return result as NewsContent;
};

const generateFeaturedImage = async (content: any) => {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Title: ${content.title}, Headlines: ${content.headline}\n Generate Featured Image for the News title based upon the provided Headlines`,
      n: 1,
      size: "1024x1024",
    }),
    // next: { revalidate: 3600 },
  });

  const image = await res.json();
  return image.data[0];
};

const sendImmediateResponse = () => {
  return new Response("Request received. Processing in the background...", {
    status: 202,
  });
};

const getFormattedDate = async (): Promise<string> => {
  const monthNames: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentDate: Date = new Date();

  const day: number = currentDate.getDate();
  const month: string = monthNames[currentDate.getMonth()];
  const year: number = currentDate.getFullYear();
  const date = `${month} ${day}, ${year}`;
  return date;
};
const fetchAndUploadImage = async (imageUrl: string, fileName: string) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const s3ImageUrl = await updateS3(fileName, buffer);
    return s3ImageUrl;
  } catch (error) {
    console.error("Error in fetchAndUploadImage:", error);
    throw error;
  }
};

export const GET = async () => {
  const immediateResponse = sendImmediateResponse();
  (async () => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      }),
      // next: { revalidate: 3600 },
    });

    const data = await res.json();
    const messageContent = data.choices[0].message.content;
    const formattedData = await formatData(messageContent);
    const featuredImage = await generateFeaturedImage(formattedData);
    const formattedDate = await getFormattedDate();
    const s3ImageUrl = await fetchAndUploadImage(
      featuredImage.url,
      `featured-images/${formattedData.title[0]}-${formattedDate}.png`
    );
    console.log(await updateDB(formattedData, s3ImageUrl, formattedDate));
  })();
  return immediateResponse;
};

export const POST = () => {};

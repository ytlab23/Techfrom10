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

interface News {
  title: string;
  headlines: string[];
}

const generatePrompt = async (existingNews: News[] | null = null) => {
  let response;
  const data = `Write me 10 tech news from the last 24 hours.

Include the following for each news item:
Title: An overall title for all 10 news items (only once at the beginning)
Headline: A headline for each news item (rephrase it with simple grammar)
Summary: A summary of minimum 50 words, maximum 100 (simple grammar). Include emojis in the summary.
Source: <Link to news>
Tag: One tag for the news (e.g. AI, Cybersecurity, etc.)
Time: How many hours ago the news is from (circa)

Use this exact format for each news item:

Title: [Overall title for all news items]

Headline: [Headline for this news item]
Summary: [Summary with emojis]
Source: [Link to news]
Tag: [One tag]
Time: [X] hours ago

[Repeat the above format for all 10 news items]

Use tags from this collection:
AI, Space, Mobile, Videogames, Biotechnology, Robotics, Nanotechnology, Social Media, Cybersecurity, Gadgets, Software, Startups, Reviews, Coding, Hardware, Innovations, Tutorials

Act like an API. This data is being displayed on a website, so don't include ** or wrap links inside text. Follow the above format exactly. Use only one tag for each news item and try to use a variety of tags. Make sure the Title is catchy and includes an emoji.
 `;
  if (existingNews) {
    const filteredNews = existingNews.map((news) => ({
      title: news.title,
      headlines: news.headlines,
    }));

    const data2 = `\n\nExisting Database: 
    
    ${JSON.stringify(filteredNews, null, 2)}
    
   Don't repeated the news from Existing Database`;

    response = data + data2;
  } else response = data;

  return response;
};

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
      const separatorIndex = line.indexOf(": ");
      if (separatorIndex === -1) return; // Skip lines without ": "

      const rawKey = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 2);

      const key = rawKey.toLowerCase();
      if (!(key in result)) (result as any)[key] = [];

      if (value) {
        (result as any)[key].push(value.replace(/^"|"$/g, ""));
      }
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
    cache: "no-store",
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
const fetchNews = async (prompt: string) => {
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
    cache: "no-cache",
    // next: { revalidate: 3600 },
  });

  const data = await res.json();
  return data.choices[0].message.content;
};

const checkPrevNews = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup"
  );
  const data = await res.json();
  if (data.length > 0) return data;
  else return false;
};
export const GET = async () => {
  const immediateResponse = sendImmediateResponse();
  (async () => {
    let prompt;
    const prevNews = await checkPrevNews();
    if (prevNews) prompt = await generatePrompt(prevNews);
    else prompt = await generatePrompt();
    const messageContent = await fetchNews(prompt);
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

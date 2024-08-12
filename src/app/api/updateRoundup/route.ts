import clientPromise from "@/lib/db";

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

const getDB = async () => {
  const client = await clientPromise;
  const db = client.db(process.env.mongo_db_name);

  return db;
};
const updateDB = async (content: NewsContent, image: NewsContent) => {
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
    imgUrl: image.url,
    expireAt: expireAt,
  };

  const doc = await collections.insertOne(data);
  console.log(doc);
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
      prompt: `Title: ${content.title}, Headlines: ${content.headline}\n This is my News Blog I need Featured Image`,
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
    await updateDB(formattedData, featuredImage);
  })();
  return immediateResponse;
};

export const POST = () => {};

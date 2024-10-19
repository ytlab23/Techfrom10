import { Pool } from "pg";
import getS3Client from "@/lib/s3";
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";

export const maxDuration = 60;

interface NewsContent {
  title: string[];
  headline: any;
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

const pool = new Pool({
  connectionString: process.env.postgresql_URL,
});

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

Act like an API. This data is being displayed on a website, so don't include ** or wrap links inside text. Follow the above format exactly. Use only one tag for each news item and try to use a variety of tags. Make sure the Title is catchy and includes an emoji.`;

  if (existingNews) {
    const filteredNews = existingNews.map((news) => ({
      title: news.title,
      headlines: news.headlines,
    }));

    const data2 = `\n\nExisting Database:

    ${JSON.stringify(filteredNews, null, 2)}

   Don't repeat the news from Existing Database`;

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
  const client = await pool.connect();
  return client;
};

const updateDB = async (
  content: NewsContent,
  image: string,
  formattedDate: string
) => {
  const client = await getDB();
  const updatedHeadlines = content.headline.map((headline: string) =>
    headline.replaceAll("-", " ")
  );
  const data = {
    title: content.title[0].replaceAll("-", " "),
    headlines: updatedHeadlines,
    summary: content.summary,
    source: content.source,
    hashtags: content.tag,
    published: content.time,
    imgUrl: image,
    date: formattedDate,
  };

  const query = `
      INSERT INTO tech_trends (title, headlines, summaries, sources, hashtags, published, img_url, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;`;

  const values = [
    data.title,
    data.headlines,
    data.summary,
    data.source,
    data.hashtags,
    data.published,
    data.imgUrl,
    data.date,
  ];

  const res = await client.query(query, values);

  return res.rows[0];
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
  const headline = content.headline[0];

  const tag = content.tag[0].toLowerCase();

  let promptBase = `Create a single, focused, high-quality image for a tech news article about ${tag}. The image should be modern, visually striking, and suitable for a professional tech news website. It should relate to the headline: "${headline}".`;

  let styleGuide =
    "Use a clean, futuristic style with a single dominant color scheme. The image should be simple yet impactful, avoiding cluttered or collage-like compositions.";

  let tagSpecific = "";

  switch (tag) {
    case "ai":
      tagSpecific =
        "Show a sleek, abstract representation of an AI brain or neural network. Use cool blues or purples for a high-tech feel.";
      break;
    case "space":
      tagSpecific =
        "Depict a single, awe-inspiring celestial object like a planet, nebula, or spacecraft. Use deep blues and bright accents.";
      break;
    case "mobile":
      tagSpecific =
        "Present a minimalist, cutting-edge smartphone or a futuristic mobile interface. Use sleek lines and a touch of vibrant color.";
      break;
    case "videogames":
      tagSpecific =
        "Showcase a stylized, iconic gaming element like a controller or an abstract game world. Use rich, vivid colors.";
      break;
    case "biotechnology":
      tagSpecific =
        "Illustrate a futuristic lab setting or a stylized DNA helix. Use clean whites with accents of green or blue.";
      break;
    case "robotics":
      tagSpecific =
        "Display a sleek, modern robot or robotic arm. Use metallic silvers and blues for an advanced tech look.";
      break;
    case "nanotechnology":
      tagSpecific =
        "Visualize microscopic tech with an artistic representation of nanoparticles or molecular structures. Use a stark color contrast for impact.";
      break;
    case "social media":
      tagSpecific =
        "Create an abstract network of connections or a minimalist icon representing social interaction. Use warm, engaging colors.";
      break;
    case "cybersecurity":
      tagSpecific =
        "Depict a futuristic digital lock or shield. Use deep blues or greens with glowing elements to represent protection.";
      break;
    case "gadgets":
      tagSpecific =
        "Show a single, sleek, futuristic device with a unique design. Use clean lines and a touch of bright color.";
      break;
    case "software":
      tagSpecific =
        "Visualize elegant flowing lines of code or a minimalist interface. Use a dark background with bright neon-like accents.";
      break;
    case "startups":
      tagSpecific =
        "Illustrate a stylized rocket or an upward-trending graph. Use energetic optimistic colors like orange or green.";
      break;
    case "reviews":
      tagSpecific =
        "Create a minimalist star rating or sleek product silhouette. Use a clean white background with bold accent colors.";
      break;
    case "coding":
      tagSpecific =
        "Show an artistic interpretation of code structure or a programmer's workspace. Use a dark theme with bright contrasting syntax highlights.";
      break;
    case "hardware":
      tagSpecific =
        "Depict a stylized futuristic computer component or circuit board. Use cool metallic tones with traces of bright color.";
      break;
    case "innovations":
      tagSpecific =
        "Illustrate an abstract lightbulb or futuristic invention. Use bright inspiring colors to represent new ideas.";
      break;
    case "tutorials":
      tagSpecific =
        "Visualize a simplified step-by-step process or futuristic learning interface. Use clean organized layout with highlight colors.";
      break;

    default:
      tagSpecific =
        "Create a general tech-themed image with circuit-like patterns or data streams. Use bold futuristic color scheme.";
  }

  const prompt = `${promptBase} ${styleGuide} ${tagSpecific} Ensure the image is not a collage and focuses on single impactful visual concept and creative. Make it instantly evocative of ${tag} and the headline's theme.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
    cache: "no-store",
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

  return `${month} ${day}, ${year}`;
};

const fetchAndUploadImage = async (imageUrl: string, fileName: string) => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image : ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    return await updateS3(fileName, buffer);
  } catch (error) {
    console.error("Error in fetchAndUploadImage:", error);
    throw error;
  }
};

const fetchNews = async (prompt: string) => {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },

    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    }),

    cache: "no-cache",
  });

  const data = await res.json();

  return data.choices[0].message.content;
};

const checkPrevNews = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup"
  );

  const data = await res.json();

  return data.length > 0 ? data : false;
};

export const GET = async () => {
  sendImmediateResponse();

  (async () => {
    let prompt;

    const prevNews = await checkPrevNews();

    prompt = prevNews ? await generatePrompt(prevNews) : await generatePrompt();

    const messageContent = await fetchNews(prompt);

    const formattedData = await formatData(messageContent);

    const featuredImage = await generateFeaturedImage(formattedData);

    const formattedDate = await getFormattedDate();

    const s3ImageUrl = await fetchAndUploadImage(
      featuredImage.url,
      `featured-images/${formattedData.title[0]}-${formattedDate}.png`
    );

    await updateDB(formattedData, s3ImageUrl, formattedDate);
  })();

  return sendImmediateResponse();
};

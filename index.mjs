import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL pool setup
const pool = new pg.Pool({
  connectionString: process.env.postgresql_URL,
});

// S3 Client setup
let s3Client = null;
const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY_ID,
      },
    });
  }
  return s3Client;
};

// Types
const monthNames = [
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

// Helper Functions
const generatePrompt = async (existingNews = null) => {
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
chrome, apple, AI, Space, Mobile, Videogames, Biotechnology, Robotics, Nanotechnology, Social Media, Cybersecurity, Gadgets, Software, Startups, Reviews, Coding, Hardware, Innovations, Tutorial.
add relavant individual company tags like amazon, google, apple, samsung etc.

Make title unique and different. Don't use general title like "Latest news" or "Latest Tech News and Updates"
Act like an API. This data is being displayed on a website, so don't include ** or wrap links inside text. Follow the above format exactly. Use only one tag for each news item and try to use a variety of tags. Make sure the Title is catchy and includes an emoji.`;

  if (existingNews) {
    const filteredNews = existingNews.map((news) => ({
      title: news.title,
      headlines: news.headlines,
    }));

    const data2 = `\n\nExisting Database (Title and News):

    ${JSON.stringify(filteredNews, null, 2)}
   Don't repeat same title from Existing Database
   Don't repeat news from Existing Database`;

    response = data + data2;
  } else {
    response = data;
  }

  return response;
};

const updateS3 = async (fileName, buffer) => {
  const s3Client = getS3Client();

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ACL: "public-read",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const formatData = async (content) => {
  const sections = content.split("\n\n");
  const result = {};

  sections.forEach((section) => {
    const lines = section.split("\n");

    lines.forEach((line) => {
      const separatorIndex = line.indexOf(": ");

      if (separatorIndex === -1) return;

      const rawKey = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 2);
      const key = rawKey.toLowerCase();

      if (!(key in result)) result[key] = [];

      if (value) {
        result[key].push(value.replace(/^"|"$/g, ""));
      }
    });
  });

  if (result.tag) {
    result.tag = result.tag.map((t) => t.toLowerCase());
  }

  return result;
};

const generateFeaturedImage = async (content) => {
  const headline = content.headline[0];
  const tag = content.tag[0].toLowerCase();

  let promptBase = `Create a single, focused, high-quality image for a tech news article about ${tag}. The image should be modern, visually striking, and suitable for a professional tech news website. It should relate to the headline: "${headline}".`;

  let styleGuide =
    "Use a clean, futuristic style with a single dominant color scheme. The image should be simple yet impactful, avoiding cluttered or collage-like compositions.";

  const tagSpecificPrompts = {
    ai: "Show a sleek, abstract representation of an AI brain or neural network. Use cool blues or purples for a high-tech feel.",
    space:
      "Depict a single, awe-inspiring celestial object like a planet, nebula, or spacecraft. Use deep blues and bright accents.",
    // ... (rest of the tag specific prompts remain the same)
  };

  const tagSpecific =
    tagSpecificPrompts[tag] ||
    "Create a general tech-themed image with circuit-like patterns or data streams. Use bold futuristic color scheme.";

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
  });

  const image = await res.json();
  return image.data[0];
};

const getFormattedDate = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  return `${month} ${day}, ${year}`;
};

const fetchAndUploadImage = async (imageUrl, fileName) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await updateS3(fileName, buffer);
  } catch (error) {
    console.error("Error in fetchAndUploadImage:", error);
    throw error;
  }
};

const fetchNews = async (prompt) => {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
};

const updateDB = async (content, image, formattedDate) => {
  const client = await pool.connect();
  try {
    const updatedHeadlines = content.headline.map((headline) =>
      headline.replaceAll("-", " ")
    );
    const updatedHashtags = content.tag.map((tag) => tag.replaceAll(" ", ""));

    const data = {
      title: content.title[0].replaceAll("-", " "),
      slugTitle: formattedDate + content.title[0].replaceAll("-", " "),
      headlines: updatedHeadlines,
      summary: content.summary,
      source: content.source,
      hashtags: updatedHashtags,
      published: content.time,
      imgUrl: image,
      date: formattedDate,
    };

    const query = `
      INSERT INTO tech_trends (title, slugTitle, headlines, summaries, sources, hashtags, published, img_url, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;`;

    const values = [
      data.title,
      data.slugTitle,
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
  } finally {
    client.release();
  }
};

//Ping
app.get("/api/ping", async (req, res) => {
  res.status(202).json({
    status:"server running"
  })
})
// Express Routes
app.get("/api/fetchRoundup", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM tech_trends ORDER BY date DESC LIMIT 10"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching roundup:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.get("/api/generateNews", async (req, res) => {
  // Send immediate response
  res
    .status(202)
    .json({ message: "Request received. Processing in the background..." });

  // Process in the background
  try {
    const prevNews = await (async () => {
      const response = await fetch(`${process.env.BASE_URL}/api/fetchRoundup`);
      const data = await response.json();
      return data.length > 0 ? data : false;
    })();

    const prompt = await generatePrompt(prevNews);
    const messageContent = await fetchNews(prompt);
    const formattedData = await formatData(messageContent);
    const featuredImage = await generateFeaturedImage(formattedData);
    const formattedDate = getFormattedDate();

    const s3ImageUrl = await fetchAndUploadImage(
      featuredImage.url,
      `featured-images/${formattedData.title[0]}-${formattedDate}.png`
    );

    await updateDB(formattedData, s3ImageUrl, formattedDate);

    console.log("News generation completed successfully");
  } catch (error) {
    console.error("Error in background processing:", error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import sharp from "sharp";

dotenv.config();

// Logging Setup
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const createLogger = () => {
  const logFileName = path.join(
    logsDir,
    `${new Date().toISOString().split("T")[0]}-tech-news.log`
  );

  return {
    log: (message, level = "INFO") => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level}] ${message}\n`;

      try {
        fs.appendFileSync(logFileName, logMessage);
        console.log(logMessage.trim()); // Also log to console
      } catch (error) {
        console.error("Logging failed:", error);
      }
    },
    error: (message) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [ERROR] ${message}\n`;

      try {
        const errorLogFileName = path.join(
          logsDir,
          `${new Date().toISOString().split("T")[0]}-errors.log`
        );
        fs.appendFileSync(errorLogFileName, logMessage);
        console.error(logMessage.trim());
      } catch (error) {
        console.error("Error logging failed:", error);
      }
    },
  };
};

const logger = createLogger();

const app = express();
const PORT = process.env.PORT || 3002;

// PostgreSQL pool setup
const pool = new pg.Pool({
  connectionString: process.env.postgresql_URL,
});

const generateSlug = (title) => {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
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

// S3 Client setup
let s3Client = null;
const getS3Client = () => {
  try {
    if (!s3Client) {
      s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_KEY_ID,
        },
      });
      logger.log("S3 Client initialized successfully");
    }
    return s3Client;
  } catch (error) {
    logger.error(`Failed to initialize S3 Client: ${error.message}`);
    throw error;
  }
};

// Helper Functions
const generatePrompt = async (existingNews = null) => {
  try {
    let response;
    const data = `Write me 10 tech news from the last 24 hours.

Include the following for each news item:
Title: An overall title for all 10 news items (only once at the beginning)
Headline: A headline for each news item (rephrase it with simple grammar)
Summary: A summary of minimum 50 words, maximum 100 (simple grammar). Include emojis in the summary.
Source: Link to news
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
Act like an API. This data is being displayed on a website, so don't include ** or wrap links inside text. Follow the above format exactly. Use only one tag for each news item and try to use a variety of tags. Make sure the Title is catchy and includes an emoji. No link wraps like []()`;

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

    logger.log("Generate prompt created successfully");
    return response;
  } catch (error) {
    logger.error(`Failed to generate prompt: ${error.message}`);
    throw error;
  }
};

const updateS3 = async (fileName, buffer) => {
  try {
    const s3Client = getS3Client();

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    logger.log(`Successfully uploaded file to S3: ${fileName}`);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    logger.error(`S3 Upload failed: ${error.message}`);
    throw error;
  }
};

const formatData = async (content) => {
  try {
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

    logger.log("Data formatted successfully");
    return result;
  } catch (error) {
    logger.error(`Data formatting failed: ${error.message}`);
    throw error;
  }
};

const generateFeaturedImage = async (content) => {
  try {
    const headline = content.headline[0];
    const tag = content.tag[0].toLowerCase();

    logger.log(
      `Generating featured image for headline: ${headline}, tag: ${tag}`
    );

    let promptBase = `Create a single, focused, high-quality image for a tech news article about ${tag}. The image should be modern, visually striking, and suitable for a professional tech news website. It should relate to the headline: "${headline}".`;

    let styleGuide =
      "Use a clean, futuristic style with a single dominant color scheme. The image should be simple yet impactful, avoiding cluttered or collage-like compositions.";

    const tagSpecificPrompts = {
      ai: "Show a sleek, abstract representation of an AI brain or neural network. Use cool blues or purples for a high-tech feel.",
      space:
        "Depict a single, awe-inspiring celestial object like a planet, nebula, or spacecraft. Use deep blues and bright accents.",
      mobile:
        "Create a minimalist, modern smartphone or tech device silhouette with futuristic elements.",
      cybersecurity:
        "Illustrate a shield or protective barrier with digital security elements.",
      robotics:
        "Design a sleek, humanoid robot or a robotic component with a clean, technological aesthetic.",
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
    logger.log("Featured image generated successfully");
    return image.data[0];
  } catch (error) {
    logger.error(`Featured image generation failed: ${error.message}`);
    throw error;
  }
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
    logger.log(`Attempting to fetch and upload image: ${fileName}`);

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Compress and resize the image
    const compressedBuffer = await sharp(originalBuffer)
      .resize({
        width: 1200, // Resize to a maximum width of 1200 pixels
        height: 630, // Maintain aspect ratio, max height of 630
        fit: "inside", // Ensure image fits within these dimensions
        withoutEnlargement: true, // Prevent upscaling smaller images
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    // Upload compressed image to S3
    const s3Url = await updateS3(
      fileName.replace(".png", ".webp"),
      compressedBuffer
    );

    // Log compression details
    const originalSize = originalBuffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(2);

    logger.log(`Image compressed successfully:
      - Original size: ${(originalSize / 1024).toFixed(2)} KB
      - Compressed size: ${(compressedSize / 1024).toFixed(2)} KB
      - Compression ratio: ${compressionRatio}%
      - URL: ${s3Url}`);

    return s3Url;
  } catch (error) {
    logger.error(`Image fetch and upload failed: ${error.message}`);
    throw error;
  }
};

const fetchNews = async (prompt) => {
  try {
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
            role: "system",
            content: `You are a tech news API that provides clean, formatted data. Follow these rules strictly:
1. Never use markdown formatting like ** or * for emphasis
2. Never wrap links in []() format
3. Provide direct, raw URLs in the Source field
4. Maintain exact formatting as specified in the prompt
5. Ensure each news item follows the exact structure:
   Headline:
   Summary:
   Source:
   Tag:
   Time:
6. No additional formatting or decorations
7. No explanatory text or meta-commentary
8. Strictly one tag per news item
9. Always include emojis in summaries`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();
    logger.log("News fetched successfully from Perplexity AI");
    return data.choices[0].message.content;
  } catch (error) {
    logger.error(`News fetching failed: ${error.message}`);
    throw error;
  }
};

const updateDB = async (content, image, formattedDate) => {
  const client = await pool.connect();

  try {
    const updatedHeadlines = content.headline.map((headline) =>
      headline.replaceAll("-", " ")
    );
    const slugHeadlines = content.headline.map((headline) =>
      generateSlug(headline)
    );
    const updatedHashtags = content.tag.map((tag) => tag.replaceAll(" ", ""));

    const data = {
      title: content.title[0].replaceAll("-", " "),
      slugTitle: generateSlug(`${formattedDate} ${content.title[0]}`),
      headlines: updatedHeadlines,
      slugHeadlines: slugHeadlines,
      summary: content.summary,
      source: content.source,
      hashtags: updatedHashtags,
      published: content.time,
      imgUrl: image,
      date: formattedDate,
    };

    const query = `
      INSERT INTO tech_trends (title, slugTitle, headlines, slugHeadlines,summaries, sources, hashtags, published, img_url, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`;

    const values = [
      data.title,
      data.slugTitle,
      data.headlines,
      data.slugHeadlines,
      data.summary,
      data.source,
      data.hashtags,
      data.published,
      data.imgUrl,
      data.date,
    ];

    const res = await client.query(query, values);
    logger.log(`Database updated successfully for: ${data.title}`);
    return res.rows[0];
  } catch (error) {
    logger.error(`Database update failed: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
};

// Express Routes
app.get("/api/fetchRoundup", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM tech_trends ORDER BY date DESC LIMIT 10"
    );
    logger.log("Fetched tech trends roundup successfully");
    res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching roundup: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.get("/api/fetch-news", async (req, res) => {
  // Send immediate response
  res.status(202).json("Request received. Processing in the background...");

  const maxAttempts = 3;

  const notifyFailure = async (error) => {
    logger.error(
      "News generation failed completely. Manual intervention required."
    );
  };

  const processNews = async (attempt = 1) => {
    try {
      logger.log(
        `Starting news generation process - Attempt ${attempt}/${maxAttempts}`
      );

      // Step 1: Fetch previous news
      logger.log("Step 1: Fetching previous news");
      const response = await fetch(`${process.env.BASE_URL}/api/fetchRoundup`);
      const prevNews = await response.json();
      const existingNews = prevNews.length > 0 ? prevNews : false;

      // Step 2: Generate prompt
      logger.log("Step 2: Generating prompt");
      const prompt = await generatePrompt(existingNews);

      // Step 3: Fetch news
      logger.log("Step 3: Fetching news from API");
      const messageContent = await fetchNews(prompt);

      // Step 4: Format data
      logger.log("Step 4: Formatting data");
      const formattedData = await formatData(messageContent);

      // Step 5: Generate and upload image
      logger.log("Step 5: Generating and uploading image");
      const featuredImage = await generateFeaturedImage(formattedData);
      const s3ImageUrl = await fetchAndUploadImage(
        featuredImage.url,
        `featured-images/${formattedData.title[0]}-${getFormattedDate()}.png`
      );

      // Step 6: Update database
      logger.log("Step 6: Updating database");
      await updateDB(formattedData, s3ImageUrl, getFormattedDate());

      logger.log("News generation completed successfully");
      return true;
    } catch (error) {
      logger.error(
        `Failed at attempt ${attempt}/${maxAttempts}: ${error.message}`
      );

      if (attempt < maxAttempts) {
        logger.log(`Waiting 5 seconds before starting over from beginning...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return processNews(attempt + 1);
      } else {
        logger.error(
          `All ${maxAttempts} attempts failed. Manual intervention required.`
        );
        try {
          // Implement your notification system here (email, Slack, etc.)
          await notifyFailure(error);
        } catch (notificationError) {
          logger.error(
            `Failed to send failure notification: ${notificationError.message}`
          );
        }
        return false;
      }
    }
  };

  processNews().catch((error) => {
    logger.error(`Unexpected error in news processing: ${error.message}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: "An unexpected error occurred" });
});

// Start server with logging
app.listen(PORT, () => {
  logger.log(`Server is running on port ${PORT}`);
});

export default app;

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.postgresql_URL,
});

const getDB = async () => {
  const client = await pool.connect();
  return client;
};

export const GET = async () => {
  const client = await getDB();
  try {
    const res = await client.query("SELECT * FROM tech_trends");
    return new Response(JSON.stringify(res.rows), {
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    client.release();
  }
};

export const POST = async (req: Request) => {
  const client = await getDB();
  const { headline } = await req.json();
  try {
    const res = await client.query(
      "SELECT * FROM tech_trends WHERE $1 = ANY(headlines);",
      [headline]
    );
    if (res.rows.length > 0) {
      const newsItem = res.rows[0];
      const index = newsItem.headlines.indexOf(headline);
      const responseData = {
        headline: newsItem.headlines[index],
        summary: newsItem.summaries[index],
        published: newsItem.published[index],
        img_url: newsItem.img_url,
        source: newsItem.sources[index],
        hashtags: newsItem.hashtags[index],
      };
      return new Response(JSON.stringify(responseData));
    }
  } finally {
    client.release();
  }
};

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.postgresql_URL,
});

const getDB = async () => {
  const client = await pool.connect();
  return client;
};

export const POST = async (req: Request) => {
  const client = await getDB();
  const { category } = await req.json();

  try {
    const res = await client.query(
      "SELECT * FROM tech_trends WHERE $1 = ANY(hashtags);",
      [category]
    );

    if (res.rows.length > 0) {
      // Prepare an array to hold all matching news items
      const responseData = res.rows.map((newsItem) => {
        const index = newsItem.hashtags.indexOf(category);
        return {
          title: newsItem.title,
          slugtitle: newsItem.slugtitle,
          headline: newsItem.headlines[index],
          summary: newsItem.summaries[index],
          published: newsItem.published[index],
          img_url: newsItem.img_url,
          source: newsItem.sources[index],
          hashtags: newsItem.hashtags[index],
          date: newsItem.date,
        };
      });

      return new Response(JSON.stringify(responseData));
    } else {
      return new Response("", { status: 404 });
    }
  } catch (error) {
    return new Response("", { status: 500 });
  } finally {
    client.release();
  }
};

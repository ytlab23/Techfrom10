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
      const responseData = res.rows.map((newsItem) => {
        const indices = newsItem.hashtags.reduce(
          (acc: number[], tag: string, idx: number) => {
            if (tag === category) acc.push(idx);
            return acc;
          },
          []
        );

        return indices.map((index: number) => ({
          title: newsItem.title,
          slugtitle: newsItem.slugtitle,
          headline: newsItem.headlines[index],
          slugheadline: newsItem.slugheadlines[index],
          summary: newsItem.summaries[index],
          published: newsItem.published[index],
          img_url: newsItem.img_url,
          source: newsItem.sources[index],
          hashtags: newsItem.hashtags[index],
          date: newsItem.date,
        }));
      });

      const flattenedData = responseData.flat();

      return new Response(JSON.stringify(flattenedData));
    } else {
      return new Response("", { status: 404 });
    }
  } catch (error) {
    return new Response("", { status: 500 });
  } finally {
    client.release();
  }
};

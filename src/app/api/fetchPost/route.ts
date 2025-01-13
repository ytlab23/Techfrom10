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
  const { title } = await req.json();
  try {
    const res = await client.query(
      "SELECT * FROM tech_trends WHERE slugTitle = $1",
      [title]
    );
    if (res.rows.length == 0) return new Response("404", { status: 404 });
    return new Response(JSON.stringify(res.rows[0]));
  } finally {
    client.release();
  }
};

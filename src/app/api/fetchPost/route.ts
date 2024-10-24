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
      "SELECT * FROM tech_trends WHERE slugtitle = $1",
      [title]
    );

    return new Response(JSON.stringify(res.rows[0]));
  } finally {
    client.release();
  }
};

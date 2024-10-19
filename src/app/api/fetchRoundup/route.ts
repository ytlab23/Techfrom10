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
  const { id } = await req.json();

  try {
    const res = await client.query("SELECT * FROM tech_trends WHERE _id = $1", [
      id,
    ]);
    return new Response(JSON.stringify(res.rows[0]), {
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    client.release();
  }
};

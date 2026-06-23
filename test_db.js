const pg = require('pg');

async function test() {
  const url = "postgresql://postgres.ubaolkuyccfyurphdmgf:globalconstruction2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  const pool = new pg.Pool({ connectionString: url });
  
  try {
    const client = await pool.connect();
    
    const res = await client.query(`SELECT COUNT(*) FROM posts;`);
    console.log("posts count:", res.rows[0].count);
    
    const res2 = await client.query(`SELECT COUNT(*) FROM projects;`);
    console.log("projects count:", res2.rows[0].count);
    
    const res3 = await client.query(`SELECT COUNT(*) FROM faqs;`);
    console.log("faqs count:", res3.rows[0].count);
    
    const res4 = await client.query(`SELECT COUNT(*) FROM jobs;`);
    console.log("jobs count:", res4.rows[0].count);

    client.release();
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    pool.end();
  }
}
test();

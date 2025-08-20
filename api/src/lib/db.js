import sql from "mssql";

const config = {
  server: process.env.SQL_SERVER,           // e.g., sql-kudos-dev.database.windows.net
  database: process.env.SQL_DATABASE,       // e.g., zest-dev
  user: process.env.SQL_USER,               // e.g., zest_admin
  password: process.env.SQL_PASSWORD,       // e.g., StrongPassword123!
  options: {
    encrypt: true,                          // Required for Azure SQL
    enableArithAbort: true
  }
};

let pool;

export async function getDbPool() {
  if (pool) return pool;

  try {
    pool = await sql.connect(config);
    console.log("✅ SQL pool connected via SQL authentication");
    return pool;
  } catch (err) {
    console.error("❌ SQL connection failed:", err);
    throw err;
  }
}

export async function query(sqlString, params = []) {
  try {
    const pool = await getDbPool();
    const request = pool.request();

    if (Array.isArray(params)) {
      params.forEach(({ name, type, value }) => {
        request.input(name, type, value);
      });
    }

    const result = await request.query(sqlString);
    return result;
  } catch (err) {
    console.error('❌ SQL Query Error:', err);
    throw err;
  }
}

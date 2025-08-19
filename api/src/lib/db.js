import sql from 'mssql';

const config = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DB,
  authentication: {
    type: 'azure-active-directory-msi-app-service'
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let poolPromise;
export function getPool() {
  if (!poolPromise) {
    console.log('Connecting to SQL with config:', config);
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

// Helper function to run a query
export async function query(sqlString, params = []) {
  const pool = await getPool();
  const request = pool.request();
  // Add parameters if provided
  if (Array.isArray(params)) {
    params.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });
  }
  return request.query(sqlString);
}

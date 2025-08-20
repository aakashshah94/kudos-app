import sql from 'mssql';
import { DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';

const isLocal = process.env.NODE_ENV !== 'production';

async function getAccessToken() {
  let credential;

  if (isLocal) {
    // Use local dev credentials (VS Code, Azure CLI, etc.)
    credential = new DefaultAzureCredential();
    console.log('Using DefaultAzureCredential for local dev');
  } else {
    // Use user-assigned managed identity in Azure App Service
    const clientId = process.env.AZURE_CLIENT_ID;
    credential = new ManagedIdentityCredential(clientId);
    console.log(`Using ManagedIdentityCredential with clientId: ${clientId}`);
  }

  const tokenResponse = await credential.getToken('https://database.windows.net/');
  return tokenResponse.token;
}

async function getConfig() {
  const token = await getAccessToken();

  return {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token,
      },
    },
  };
}

let poolPromise;

export async function getPool() {
  if (!poolPromise) {
    const config = await getConfig();
    console.log('🛠️ Connecting to SQL with config:', {
      server: config.server,
      database: config.database,
      authType: config.authentication.type,
    });

    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

export async function query(sqlString, params = []) {
  try {
    const pool = await getPool();
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

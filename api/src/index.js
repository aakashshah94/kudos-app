import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api', apiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
console.log('SQL_SERVER:', process.env.SQL_SERVER);
console.log('SQL_DB:', process.env.SQL_DB);
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID);
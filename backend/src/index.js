import dotenv from 'dotenv';
dotenv.config();   // ← must be first line before all other imports

import express       from 'express';
import cors          from 'cors';
import generateRoute from './routes/generate.js';
import uploadRoute   from './routes/upload.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.json({ 
  status: 'ok', 
  ts: Date.now(),
  teeAddress: process.env.TEE_PRIVATE_KEY ? 'loaded' : 'MISSING',
  computeUrl: process.env.OG_COMPUTE_URL  || 'MISSING',
  computeKey: process.env.OG_COMPUTE_KEY  ? 'loaded' : 'MISSING',
}));

app.use('/api/generate', generateRoute);
app.use('/api/upload',   uploadRoute);

app.listen(PORT, () => {
  console.log(`PAICO backend running on :${PORT}`);
  console.log(`Compute URL: ${process.env.OG_COMPUTE_URL}`);
  console.log(`Compute key: ${process.env.OG_COMPUTE_KEY ? 'SET' : 'NOT SET'}`);
});
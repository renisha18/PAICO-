import dotenv from 'dotenv';
dotenv.config();  // ← must be FIRST, before all other imports

import express        from 'express';
import cors           from 'cors';
import generateRoute  from './routes/generate.js';
import uploadRoute    from './routes/upload.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));
app.use('/api/generate', generateRoute);
app.use('/api/upload',   uploadRoute);

app.listen(PORT, () => console.log(`PAICO backend running on :${PORT}`));
import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/tryon', express.static(join(__dirname, '..', 'public', 'tryon')));
app.use(routes);

app.listen(PORT, () => {
  const keyStatus = process.env.OPENAI_API_KEY ? '✓ OpenAI API 已配置' : '⚠ Demo 模式（设 OPENAI_API_KEY 启用 AI 试戴）';
  console.log(`\n  妙手 Backend → http://localhost:${PORT}`);
  console.log(`  ${keyStatus}\n`);
});

import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const app = express();

// CORS: allow Vite dev server + production same-origin
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Serve AI try-on result images
app.use('/tryon', express.static(join(__dirname, '..', 'public', 'tryon')));

// API routes
app.use(routes);

// In production: serve built frontend
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  // Skip API / health / tryon routes
  if (req.path.startsWith('/v1/') || req.path.startsWith('/health') || req.path.startsWith('/tryon/')) {
    return next();
  }
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  妙手 Backend → http://localhost:${PORT}`);
  console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET (length=' + process.env.OPENAI_API_KEY.length + ')' : 'MISSING'}`);
  console.log(`  OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || 'MISSING'}`);
  console.log(`  OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'MISSING'}`);
  console.log(`  TLS_REJECT: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
  console.log(`  dist exists: ${existsSync(distPath)}`);
  const keyStatus = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10 ? '✓ AI 已配置' : '⚠ Demo 模式（OPENAI_API_KEY 未设置）';
  console.log(`  ${keyStatus}\n`);
});

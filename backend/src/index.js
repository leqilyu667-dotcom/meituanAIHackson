import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(routes);

app.listen(PORT, () => {
  console.log(`\n  妙手 Backend → http://localhost:${PORT}\n`);
});

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'node:http';
import problemsRouter from './routes/problems';
import roomsRouter from './routes/rooms';
import { createSocketServer } from './socket';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);
const httpServer = createServer(app);
const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string): boolean {
  // Non-browser clients (curl, health checks) do not send Origin.
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (origin.startsWith("http://localhost:")) return true;
  if (origin.startsWith("http://127.0.0.1:")) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin ?? "unknown"}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/problems', problemsRouter);
app.use('/rooms', roomsRouter);

createSocketServer(httpServer, isAllowedOrigin);

httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

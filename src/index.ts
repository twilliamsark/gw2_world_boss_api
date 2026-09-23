import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bossesRoutes from './routes/bosses.routes';

// Local `.env` is optional — Vercel injects TURSO_* / NODE_ENV as process.env.
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT ?? process.env.NODE_GW2_PORT ?? 80);

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use('/api/bosses', bossesRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'TypeScript Express API is operational.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server running at http://localhost:${PORT}`);
  });
}

export default app;

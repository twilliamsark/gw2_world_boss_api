import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bossesRoutes from './routes/bosses.routes';

const envConfig = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (envConfig.error) {
  throw envConfig.error;
}

const app: Application = express();
const PORT = Number(process.env.PORT ?? process.env.NODE_GW2_PORT ?? 80);

// Body parsing middleware
app.use(express.json());

// API Route Mounts
app.use('/api/bosses', bossesRoutes);

// Root Fallback Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'TypeScript Express API is operational.' });
});

// Start Server Listener
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server running at http://localhost:${PORT}`);
  });
}

export default app;

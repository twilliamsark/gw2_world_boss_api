import { Router } from 'express';
import { getGWBosses } from '../controllers/bosses.controller';
import { getHardBosses } from '../controllers/hard_bosses.controller';

const router = Router();

router.get('/gw', async (req, res) => {
  const data = await getGWBosses();
  res.status(200).send(data);
});

router.get('/gw-hwb', async (req, res) => {
  const data = await getHardBosses();
  res.status(200).send(data);
});

export default router;

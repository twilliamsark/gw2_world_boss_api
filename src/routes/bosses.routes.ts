import { Router } from 'express';
import { getGWBosses } from '../controllers/bosses.controller';

const router = Router();

router.get('/gw', async (req, res) => {
  const data = await getGWBosses();
  res.status(200).send(data);
});

export default router;

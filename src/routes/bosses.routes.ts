import { Router } from 'express';
import { getBosses, getGWBosses } from '../controllers/bosses.controller';

const router = Router();

router.get('/', getBosses);
router.get('/gw', async (req, res) => {
  const data = await getGWBosses();
  res.status(200).send(data);
});

export default router;

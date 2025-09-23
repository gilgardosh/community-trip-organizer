import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, (req, res) => {
  res.status(200).json({ message: 'success' });
});

export default router;

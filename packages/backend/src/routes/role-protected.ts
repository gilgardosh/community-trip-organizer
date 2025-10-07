import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Route accessible by all authenticated users (FAMILY, TRIP_ADMIN, SUPER_ADMIN)
router.get('/all', protect, (req, res) => {
  res
    .status(200)
    .json({ message: 'All authenticated users can access this route' });
});

// Route accessible only by FAMILY role
router.get('/family', protect, authorize(Role.FAMILY), (req, res) => {
  res.status(200).json({ message: 'Only FAMILY users can access this route' });
});

// Route accessible only by TRIP_ADMIN and SUPER_ADMIN roles
router.get(
  '/admin',
  protect,
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  (req, res) => {
    res.status(200).json({
      message: 'Only TRIP_ADMIN and SUPER_ADMIN users can access this route',
    });
  },
);

// Route accessible only by SUPER_ADMIN role
router.get('/super-admin', protect, authorize(Role.SUPER_ADMIN), (req, res) => {
  res
    .status(200)
    .json({ message: 'Only SUPER_ADMIN users can access this route' });
});

export default router;

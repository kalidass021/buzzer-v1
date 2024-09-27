import express from 'express';
import {
  getNotifications,
  deleteNotifications,
//   deleteNotification,
} from '../controllers/notification.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNotifications);
// router.delete('/:id', protectRoute, deleteNotification);

export default router;

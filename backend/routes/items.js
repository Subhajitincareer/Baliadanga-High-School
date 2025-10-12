import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/').get(getItems).post(createItem);
router.route('/:id').get(getItem).put(updateItem).delete(deleteItem);

export default router;
import express from 'express';
import { checkWhitelist } from '../controllers/adminController.js';

const router = express.Router();

router.get('/whitelist/:email', checkWhitelist);

export default router;

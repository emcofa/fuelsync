import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as searchController from '../controllers/search.controller';

const router = Router();

router.get('/food', requireAuth, searchController.searchFood);
router.get('/barcode/:code', requireAuth, searchController.searchBarcode);

export default router;

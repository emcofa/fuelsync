import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import * as searchService from '../services/search.service';

export const searchFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const query = req.query.q;
    if (typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    const results = await searchService.searchFood(query.trim(), userId);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const searchBarcode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.params.code;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Barcode is required' });
      return;
    }
    const result = await searchService.searchBarcode(code);
    if (!result) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createCustomFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const result = await searchService.createCustomFood(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

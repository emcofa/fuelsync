import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import * as favoritesService from '../services/favorites.service';

export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const favorites = await favoritesService.getFavorites(userId);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const favorite = await favoritesService.addFavorite(userId, req.body);
    res.status(201).json(favorite);
  } catch (err) {
    if (err instanceof Error && err.message === 'DUPLICATE') {
      res.status(409).json({ error: 'Already in favorites' });
      return;
    }
    next(err);
  }
};

export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const favoriteId = Number(req.params.id);
    if (isNaN(favoriteId)) {
      res.status(400).json({ error: 'Invalid favorite ID' });
      return;
    }
    const deleted = await favoritesService.removeFavorite(userId, favoriteId);
    if (!deleted) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

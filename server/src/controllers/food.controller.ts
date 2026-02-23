import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import * as foodService from '../services/food.service';

export const logFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const entry = await foodService.logFood(userId, req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const getDailyLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const summary = await foodService.getDailyLog(userId, date);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export const deleteEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const entryId = Number(req.params.id);
    if (isNaN(entryId)) {
      res.status(400).json({ error: 'Invalid entry ID' });
      return;
    }
    const deleted = await foodService.deleteEntry(userId, entryId);
    if (!deleted) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

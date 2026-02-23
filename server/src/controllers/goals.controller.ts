import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import * as goalsService from '../services/goals.service';

export const getGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const goals = await goalsService.getGoals(userId);
    if (!goals) {
      res.status(404).json({ error: 'No macro targets found. Complete your profile first.' });
      return;
    }
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

export const updateGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const goals = await goalsService.updateGoals(userId, req.body);
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

export const resetGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const goals = await goalsService.resetGoals(userId);
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

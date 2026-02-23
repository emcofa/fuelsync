import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import * as aiService from '../services/ai.service';

export const suggest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const result = await aiService.suggest(req.body);
    res.json(result);
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 502) {
      res.status(502).json({ error: 'AI response could not be parsed' });
      return;
    }
    next(err);
  }
};

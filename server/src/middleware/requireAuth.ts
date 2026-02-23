import { requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

const syncUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return next();
    // Full sync logic comes in Phase 2 — this is the stub
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = [clerkRequireAuth(), syncUserMiddleware];
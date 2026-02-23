import { requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { syncUser } from '../services/user.service';

const syncUserMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) return next();

    const email = (sessionClaims as Record<string, unknown>)?.email as string | undefined;
    await syncUser(userId, email ?? '');
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = [clerkRequireAuth(), syncUserMiddleware];
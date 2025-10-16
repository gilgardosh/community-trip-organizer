import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from 'passport-jwt';
import { prisma } from '../utils/db.js';
import { Role, User } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
};

interface JwtPayload {
  id: string;
  role: Role;
}

const jwtVerify: VerifyCallback = (payload: JwtPayload, done) => {
  prisma.user
    .findUnique({
      where: { id: payload.id },
    })
    .then((user) => {
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
    .catch((error) => {
      return done(error, false);
    });
};

passport.use(new JwtStrategy(jwtOptions, jwtVerify));

export const protect = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    const user = req.user as User;
    if (!roles.includes(user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }
    next();
  };
};

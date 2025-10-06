import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), `.env`),
});

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    },
    facebook: {
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3001/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
  },
};

export default config;

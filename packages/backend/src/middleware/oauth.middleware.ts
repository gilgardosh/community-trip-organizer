import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from 'passport-google-oauth20';
import {
  Strategy as FacebookStrategy,
  Profile as FacebookProfile,
} from 'passport-facebook';
import { prisma } from '../utils/db.js';
import { getOAuthConfig } from '../config/env.js';
import { UserType, Role, User } from '@prisma/client';
import { VerifyCallback } from 'passport-oauth2';

const oauthConfig = getOAuthConfig();

// Google OAuth Strategy
if (oauthConfig.google.clientID && oauthConfig.google.clientID !== '') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: oauthConfig.google.clientID,
        clientSecret: oauthConfig.google.clientSecret,
        callbackURL: oauthConfig.google.callbackURL,
        scope: ['profile', 'email'],
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
      ) => {
        // Wrap in void to ignore Promise
        void handleOAuthUser('google', profile, done);
      },
    ),
  );
}

// Facebook OAuth Strategy
if (oauthConfig.facebook.clientID && oauthConfig.facebook.clientID !== '') {
  passport.use(
    new FacebookStrategy(
      {
        clientID: oauthConfig.facebook.clientID,
        clientSecret: oauthConfig.facebook.clientSecret,
        callbackURL: oauthConfig.facebook.callbackURL,
        profileFields: oauthConfig.facebook.profileFields,
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: FacebookProfile,
        done: VerifyCallback,
      ) => {
        // Wrap in void to ignore Promise
        void handleOAuthUser('facebook', profile, done);
      },
    ),
  );
}

// Common handler for OAuth users
async function handleOAuthUser(
  provider: string,
  profile: GoogleProfile | FacebookProfile,
  done: VerifyCallback,
): Promise<void> {
  try {
    // Extract profile data
    const email =
      profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const providerId = profile.id;
    const displayName = profile.displayName || 'Unknown User';
    const photoUrl =
      profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    if (!email) {
      done(new Error(`No email found from ${provider} profile`));
      return;
    }

    // Check if the user already exists by OAuth provider ID first, then by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            oauthProvider: provider,
            oauthProviderId: providerId,
          },
          { email },
        ],
      },
    });

    if (user) {
      // User exists, update OAuth info if needed
      if (!user.oauthProvider || !user.oauthProviderId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: provider,
            oauthProviderId: providerId,
            profilePhotoUrl: user.profilePhotoUrl || photoUrl, // Update photo only if not set
          },
        });
      }
      done(null, user);
      return;
    } else {
      // Create a new family for the user
      const family = await prisma.family.create({
        data: {
          name: `${displayName}'s Family`,
        },
      });

      // Create a new user (with empty string for passwordHash since it can't be null)
      const newUser = await prisma.user.create({
        data: {
          name: displayName,
          email: email,
          familyId: family.id,
          type: UserType.ADULT,
          role: Role.FAMILY,
          oauthProvider: provider,
          oauthProviderId: providerId,
          passwordHash: '', // Empty string since it can't be null
          profilePhotoUrl: photoUrl,
        },
      });

      done(null, newUser);
      return;
    }
  } catch (error) {
    done(
      error instanceof Error
        ? error
        : new Error('Unknown error during OAuth authentication'),
    );
    return;
  }
}

// Passport serialize/deserialize for session handling if needed
passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser((id: string, done) => {
  prisma.user
    .findUnique({ where: { id } })
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, undefined);
    });
});

// Export configured passport instance
export default passport;

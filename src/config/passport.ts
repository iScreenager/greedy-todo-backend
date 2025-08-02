import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingGoogleUser = await User.findOne({ googleId: profile.id });

        if (existingGoogleUser) {
          return done(null, existingGoogleUser);
        } else {
          const existingEmailUser = await User.findOne({
            email: profile.emails?.[0].value,
          });

          if (existingEmailUser) {
            existingEmailUser.googleId = profile.id;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
          } else {
            const newUser = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0].value,
              googleId: profile.id,
              role: "normaluser",
            });

            return done(null, newUser);
          }
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

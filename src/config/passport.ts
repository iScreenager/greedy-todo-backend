import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

function normalizeGooglePhoto(photoUrl?: string, size = 200) {
  if (!photoUrl) return undefined;

  return photoUrl.replace(/(=s\d+-c)|(\?sz=\d+)/, `?sz=${size}`);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const photoFromProfile = profile.photos?.[0]?.value || "";
        const photo = normalizeGooglePhoto(photoFromProfile, 200);

        const existingGoogleUser = await User.findOne({ googleId: profile.id });

        if (existingGoogleUser) {
          return done(null, existingGoogleUser);
        } else {
          const existingEmailUser = await User.findOne({
            email: profile.emails?.[0].value,
          });

          if (existingEmailUser) {
            existingEmailUser.googleId = profile.id;
            existingEmailUser.updatedAt = new Date();
            await existingEmailUser.save();
            return done(null, existingEmailUser);
          } else {
            const newUser = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0].value,
              googleId: profile.id,
              role: "normaluser",
              createdAt: new Date(),
              updatedAt: new Date(),
              authProvider: "google",
              photo: photo,
              lastLogin: new Date().getTime(),
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

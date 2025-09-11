import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { register, login } from "../controllers/authController";
import User, { IUser } from "../models/user";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ error: "Google authnetication fail" });
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: "2d" }
    );

    const updatedUser = await User.findOneAndUpdate(
      { googleId: user.googleId },
      { $set: { lastLogin: new Date() } },
      { new: true }
    );

    const userObj = {
      name: updatedUser?.name,
      id: updatedUser?._id,
      email: updatedUser?.email,
      role: updatedUser?.role,
      createdAt: updatedUser?.createdAt,
      updatedAt: updatedUser?.updatedAt,
      authProvider: updatedUser?.authProvider,
      photo: updatedUser?.photo,
      lastLoginTime: updatedUser?.lastLogin,
    };

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`
    );
  }
);

export default router;

import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  authProvider?: string;
  isGuest?: boolean;
}

const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Authentication failed. Token missing.");
    }

    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    if (decodedUser.isGuest) {
      req.user = {
        userId: decodedUser.userId,
        email: decodedUser.email,
        role: decodedUser.role,
        authProvider: decodedUser.authProvider,
        isGuest: true,
      };
      return next();
    }

    const user = await User.findById(decodedUser.userId);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = decodedUser;
    next();
  } catch (err) {
    res.status(401).send({ error: "Authentication failed.", err });
  }
};

export default authenticateToken;

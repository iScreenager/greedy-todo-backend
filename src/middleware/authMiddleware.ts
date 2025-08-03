import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
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
    req.user = decodedUser;
    next();
  } catch (err) {
    res.status(401).send({ error: "Authentication failed.", err });
  }
};

export default authenticateToken;

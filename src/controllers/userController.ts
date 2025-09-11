import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

interface AuthenticatedRequest extends Request {
  user?: { userId?: string; email?: string; role?: string };
}

const createToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret not configured");
  return jwt.sign(payload, secret, { expiresIn: "2d" });
};

export const editProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, name, photo } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let changed = false;

    if (email && email !== user.email) {
      user.email = email.toLowerCase();
      changed = true;
    }

    if (name && name !== user.name) {
      user.name = name;
      changed = true;
    }

    if (photo && photo !== user.photo) {
      user.photo = photo;
      changed = true;
    }

    if (changed) {
      user.updatedAt = new Date();
      await user.save();
    } else {
      return res.status(400).json({ error: "No changes detected" });
    }

    const token = createToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      token,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        authProvider: user?.authProvider,
        lastLoginTime: user?.lastLogin,
      },
    });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllUsers = async (_: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().lean();
    const newUsers = users.map(({ _id, ...rest }) => {
      return { id: _id, ...rest };
    });
    res.status(200).json(newUsers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = user.role === "superuser" ? "normaluser" : "superuser";
    await user.save();

    // const io = req.app.get("io");
    // if (io) {
    //   io.emit("userTypeUpdated", {
    //     userId: user._id,
    //     role: user.role,
    //   });
    // }

    return res.status(200).json({
      message: `User role changed to ${user.role}`,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error updating role:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

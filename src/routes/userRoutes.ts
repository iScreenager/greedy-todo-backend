import express from "express";
import {
  changeUserRole,
  editProfile,
  getAllUsers,
} from "../controllers/userController";
import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getAllUsers);
router.patch("/", authenticateToken, editProfile);
router.patch("/:id", authenticateToken, changeUserRole);

export default router;

import express from "express";
import {
  createTask,
  deleteTask,
  getAllTask,
  getTasksById,
  updateTask,
} from "../controllers/taskControllers";
import authenticateToken from "../middleware/authMiddleware";


const router = express.Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getAllTask);
router.get("/:id", authenticateToken, getTasksById);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;

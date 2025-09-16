import { Request, Response } from "express";
import Task from "../models/task";
import { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, dueDate, dueTime } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    if (!title || !description || !dueDate || !dueTime) {
      return res.status(400).json({
        error: "Title, description, dueDate, and dueTime are required.",
      });
    }

    await Task.create({
      userId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate,
      dueTime,
      status: undefined,
    });

    return res.status(201).json({
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      error: "Internal server error while creating task",
    });
  }
};

export const getAllTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const tasks = await Task.find({ userId: req.user?.userId });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err });
  }
};

export const getTasksById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findOne({
      _id: taskId,
      userId: req.user?.userId,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ task });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong:",err });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const { title, description, dueDate, dueTime } = req.body;

    const task = await Task.findOne({ _id: taskId, userId: req.user?.userId });

    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    task.dueTime = dueTime ?? task.dueTime;
    task.status = undefined;

    await task.save();

    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

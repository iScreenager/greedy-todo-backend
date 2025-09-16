import Task, { ITask } from "../models/task";
import { Server } from "socket.io";

export const startNotificationJob = (io: Server) => {
  setInterval(async () => {
    for (const [socketId, socket] of io.sockets.sockets) {
      const userId = socket.data.userId;
      if (!userId) continue;

      try {
        const userTasks = await getUserTasksStatus(userId);
        if (userTasks.length > 0) {
          socket.emit("getNotification", userTasks);
        }
      } catch (err) {
        console.error("Error fetching tasks for user:", userId, err);
      }
    }
  }, 60 * 1000);
};

export async function getUserTasksStatus(userId: string) {
  try {
    const tasks: ITask[] = await Task.find({ userId }).lean();
    const now = new Date();

    const result: ITask[] = [];

    for (const task of tasks) {
      if (!task.dueDate || !task.dueTime) continue;

      const [hours, minutes] = task.dueTime.split(":").map(Number);
      const dueDateTime = new Date(task.dueDate);
      dueDateTime.setHours(hours, minutes, 0, 0);

      const fourHoursBefore = new Date(
        dueDateTime.getTime() - 4 * 60 * 60 * 1000
      );

      if (dueDateTime.getTime() <= now.getTime()) {
        if (task.status !== "expired") {
          await Task.findByIdAndUpdate(task._id, { status: "expired" });
          result.push({ ...task, status: "expired" });
        }
        continue;
      }

      const diff = now.getTime() - fourHoursBefore.getTime();
      if (Math.abs(diff) <= 60 * 1000) {
        if (task.status !== "4hr") {
          await Task.findByIdAndUpdate(task._id, { status: "4hr" });
          result.push({ ...task, status: "4hr" });
        }
        continue;
      }
    }

    return result as ITask[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

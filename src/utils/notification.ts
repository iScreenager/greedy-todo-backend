import Task, { ITask } from "../models/task";
import { Server } from "socket.io";

export const startNotificationJob = (io: Server) => {
  setInterval(async () => {
    console.log("Running notification job...");
    for (const [socketId, socket] of io.sockets.sockets) {
      const userId = socket.data.userId;
      if (!userId) continue;
      console.log(socketId);
      try {
        const userTasks = await getUserTasksStatus(userId);
        socket.emit("getNotification", userTasks);
      } catch (err) {
        console.error("Error fetching tasks for user:", userId, err);
      }
    }
  }, 10000);
};

export async function getUserTasksStatus(userId: string) {
  try {
    const tasks: ITask[] = await Task.find({ userId }).lean();

    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const result: ITask[] = [];

    for (const task of tasks) {
      if (!task.dueTime) continue;
      const [hours, minutes] = task.dueTime.split(":").map(Number);

      const dueDateTime = new Date(task.dueDate);
      dueDateTime.setHours(hours, minutes, 0, 0);

      if (dueDateTime <= now) {
        result.push({ ...task, status: "expired" });
      } else if (dueDateTime > now && dueDateTime <= fourHoursLater) {
        result.push({ ...task, status: "4hr" });
      }
    }
    return result as ITask[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

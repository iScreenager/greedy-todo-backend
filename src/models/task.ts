import mongoose, { Model, Schema } from "mongoose";

export interface ITask {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: number;
  dueTime: string;
  createdAt: Date;
  updatedAt: Date;
  status?: "expired" | "4hr";
}

const taskSchema: Schema<ITask> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: {
      type: Number,
      required: true,
    },
    dueTime: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
export default Task;

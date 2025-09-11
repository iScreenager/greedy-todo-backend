import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "normaluser" | "superuser";
  createdAt: Date;
  updatedAt: Date;
  authProvider: "local" | "google";
  photo?: string;
  lastLogin: number;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      minlength: 8,
    },
    googleId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["normaluser", "superuser"],
      default: "normaluser",
    },
    photo: { type: String, default: "" },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    lastLogin: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;

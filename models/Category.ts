import mongoose, { Types } from "mongoose";

export interface ICategory {
  id: string;
  name: string;
  title: string;
  userId: Types.ObjectId;
  createdAt?: string;
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: [true, "Please add name"],
  },
  title: {
    type: String,
    required: [true, "Please add title"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model("Category", CategorySchema);

export { Category };

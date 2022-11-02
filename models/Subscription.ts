import mongoose, { Types } from "mongoose";

export interface ISubscription {
  name: string;
  icon?: string;
  currency: string;
  cost: number;
  isDisabled?: boolean;
  firstBill?: string;
  cycleMultiplier?: number;
  cyclePeriod?: "day" | "week" | "month" | "year";
  durationMultiplier?: number;
  durationPeriod?: "forever" | "day" | "week" | "month" | "year";
  remindMeBeforeDays?: number; //days before
  description?: string;
  categoryId?: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt?: string;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    name: {
      type: String,
      required: [true, "Please add name"],
    },
    icon: String,
    currency: {
      type: String,
      required: [true, "Currency is mendatory"],
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    cost: {
      type: Number,
      required: [true, "Please add cost"],
    },
    firstBill: Date,
    cycleMultiplier: {
      type: Number,
      default: 1,
    },
    cyclePeriod: {
      type: String,
      enum: ["day", "week", "month", "year"],
      default: "month",
    },
    durationMultiplier: {
      type: Number,
      default: 1,
    },
    durationPeriod: {
      type: String,
      enum: ["forever", "day", "week", "month", "year"],
      default: "forever",
    },
    remindMeBeforeDays: {
      type: Number,
      default: 1,
    },
    description: String,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SubscriptionSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export { Subscription };

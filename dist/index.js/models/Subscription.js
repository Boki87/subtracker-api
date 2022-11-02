"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SubscriptionSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
SubscriptionSchema.virtual("category", {
    ref: "Category",
    localField: "categoryId",
    foreignField: "_id",
});
const Subscription = mongoose_1.default.model("Subscription", SubscriptionSchema);
exports.Subscription = Subscription;

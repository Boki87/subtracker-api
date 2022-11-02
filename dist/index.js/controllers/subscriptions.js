"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscription = exports.getSubscriptions = exports.deleteSubscription = exports.updateSubscription = exports.createSubscription = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Subscription_1 = require("../models/Subscription");
// @desc    Fetch all subscription for user
// @route   GET /api/v1/subscriptions
// @access  Private
const getSubscriptions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const subscriptions = yield Subscription_1.Subscription.find({
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
    }).populate("category");
    // .populate({
    //    path: 'categoryId',
    //   select: "name"
    //});
    res.status(200).json({
        success: true,
        data: subscriptions,
    });
}));
exports.getSubscriptions = getSubscriptions;
// @desc    Fetch single subscription for user
// @route   GET /api/v1/subscriptions/:id
// @access  Private
const getSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const subscription = yield Subscription_1.Subscription.findById(req.params.id).populate("category");
    if (!subscription) {
        res.status(404);
        throw new Error("Subscription not found");
    }
    //Make sure user is owner of subscription
    if (((_b = subscription.userId) === null || _b === void 0 ? void 0 : _b.toString()) !== ((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id)) {
        res.status(401);
        throw new Error("Not authorized to delete this subscription");
    }
    res.status(200).json({
        success: true,
        data: subscription,
    });
}));
exports.getSubscription = getSubscription;
// @desc    Create new subsription
// @route   POST /api/v1/subscriptions
// @access  Private
const createSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(400);
        throw new Error("Not logged in");
    }
    const subscription = yield Subscription_1.Subscription.create(Object.assign(Object.assign({}, req.body), { userId: user.id }));
    res.status(200).json({
        success: true,
        data: subscription,
    });
}));
exports.createSubscription = createSubscription;
// @desc    Update subscription
// @route   PUT /api/v1/subscriptions/:id
// @access  Private
const updateSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptionId = req.params.id;
    const user = req.user;
    if (!user) {
        res.status(400);
        throw new Error("Not logged in");
    }
    const fieldsToUpdate = {
        name: req.body.name,
        icon: req.body.icon,
        currency: req.body.currency,
        cost: req.body.cost,
        isDisabled: req.body.isDisabled,
        firstBill: req.body.firstBill,
        cycleMultiplier: req.body.cycleMultiplier,
        cyclePeriod: req.body.cyclePeriod,
        durationMultiplier: req.body.durationMultiplier,
        durationPeriod: req.body.durationPeriod,
        remindMe: req.body.remindMe,
        description: req.body.description,
        categoryId: req.body.categoryId,
    };
    const subscription = yield Subscription_1.Subscription.findByIdAndUpdate(subscriptionId, fieldsToUpdate, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        data: subscription,
    });
}));
exports.updateSubscription = updateSubscription;
// @desc    Delete subscription
// @route   DELETE /api/v1/subscriptions/:id
// @access  Private
const deleteSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const subscription = yield Subscription_1.Subscription.findById(req.params.id);
    if (!subscription) {
        res.status(404);
        throw new Error("Not sure with the id of " + req.params.id);
    }
    //Make sure user is owner of subscription
    if (((_d = subscription.userId) === null || _d === void 0 ? void 0 : _d.toString()) !== ((_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e.id)) {
        res.status(401);
        throw new Error("Not authorized to delete this subscription");
    }
    yield subscription.remove();
    res.status(200).json({
        success: true,
        data: {},
    });
}));
exports.deleteSubscription = deleteSubscription;

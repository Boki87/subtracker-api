"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptions_1 = require("../controllers/subscriptions");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route("/").get(auth_1.protectedRoute, subscriptions_1.getSubscriptions);
router.route("/").post(auth_1.protectedRoute, subscriptions_1.createSubscription);
router
    .route("/:id")
    .get(auth_1.protectedRoute, subscriptions_1.getSubscription)
    .put(auth_1.protectedRoute, subscriptions_1.updateSubscription)
    .delete(auth_1.protectedRoute, subscriptions_1.deleteSubscription);
exports.default = router;

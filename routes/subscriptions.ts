import express from "express";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptions,
  getSubscription,
  deleteSubscriptions,
} from "../controllers/subscriptions";
import { protectedRoute } from "../middleware/auth";

const router = express.Router();

router.route("/").get(protectedRoute, getSubscriptions);
router.route("/").post(protectedRoute, createSubscription);
router
  .route("/:id")
  .get(protectedRoute, getSubscription)
  .put(protectedRoute, updateSubscription)
  .delete(protectedRoute, deleteSubscription);
router.route("/").delete(protectedRoute, deleteSubscriptions);

export default router;

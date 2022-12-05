import express from "express";
import { protectedRoute } from "../middleware/auth";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategories,
  getCategory,
} from "../controllers/categories";

const router = express.Router();

router
  .route("/")
  .post(protectedRoute, createCategory)
  .get(protectedRoute, getCategories);

router
  .route("/:id")
  .put(protectedRoute, updateCategory)
  .delete(protectedRoute, deleteCategory)
  .get(protectedRoute, getCategory);

export default router;

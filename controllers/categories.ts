import asyncHandler from "express-async-handler";
import { Category } from "../models/Category";

// @desc    Get categories
// @route   GET /api/v1/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ userId: req.user?.id });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get category
// @route   GET /api/v1/categories/:id
// @access  Private
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  let name = req.body.title.toLowerCase().split(" ").join("_");
  const category = await Category.create({
    ...req.body,
    userId: req.user?.id,
    name,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  private
const updateCategory = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    title: req.body.title,
    name: req.body.title.toLowerCase().split(" ").join("_"),
  };

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  if (!category) {
    res.status(404);
    throw new Error("Not sure with category id: " + req.params.id);
  }

  //Check if user is owner
  if (category.userId?.toString() !== req.user?.id) {
    res.status(401);
    throw new Error("Not authorized to update category");
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Not sure with category id: " + req.params.id);
  }

  //Check if user is owner
  if (category.userId?.toString() !== req.user?.id) {
    res.status(401);
    throw new Error("Not authorized to update category");
  }

  await category.remove();

  res.status(200).json({ success: true, data: {} });
});

export {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategories,
  getCategory,
};

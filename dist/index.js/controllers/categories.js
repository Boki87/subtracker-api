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
exports.getCategories = exports.updateCategory = exports.deleteCategory = exports.createCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Category_1 = require("../models/Category");
// @desc    Get category
// @route   GET /api/v1/categories
// @access  Private
const getCategories = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const categories = yield Category_1.Category.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    res.status(200).json({
        success: true,
        data: categories,
    });
}));
exports.getCategories = getCategories;
// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
const createCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const category = yield Category_1.Category.create(Object.assign(Object.assign({}, req.body), { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }));
    res.status(200).json({
        success: true,
        data: category,
    });
}));
exports.createCategory = createCategory;
// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  private
const updateCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const fieldsToUpdate = {
        name: req.body.name,
    };
    const category = yield Category_1.Category.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true, runValidators: true });
    if (!category) {
        res.status(404);
        throw new Error("Not sure with category id: " + req.params.id);
    }
    //Check if user is owner
    if (((_c = category.userId) === null || _c === void 0 ? void 0 : _c.toString()) !== ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
        res.status(401);
        throw new Error("Not authorized to update category");
    }
    res.status(200).json({
        succes: true,
        data: category,
    });
}));
exports.updateCategory = updateCategory;
// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
const deleteCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const category = yield Category_1.Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error("Not sure with category id: " + req.params.id);
    }
    //Check if user is owner
    if (((_e = category.userId) === null || _e === void 0 ? void 0 : _e.toString()) !== ((_f = req.user) === null || _f === void 0 ? void 0 : _f.id)) {
        res.status(401);
        throw new Error("Not authorized to update category");
    }
    yield category.remove();
    res.status(200).json({ success: true, data: {} });
}));
exports.deleteCategory = deleteCategory;

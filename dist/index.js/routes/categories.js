"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const categories_1 = require("../controllers/categories");
const router = express_1.default.Router();
router
    .route("/")
    .post(auth_1.protectedRoute, categories_1.createCategory)
    .get(auth_1.protectedRoute, categories_1.getCategories);
router
    .route("/:id")
    .put(auth_1.protectedRoute, categories_1.updateCategory)
    .delete(auth_1.protectedRoute, categories_1.deleteCategory);
exports.default = router;

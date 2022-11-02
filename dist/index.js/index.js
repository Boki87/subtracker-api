"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const categories_1 = __importDefault(require("./routes/categories"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: "./config/config.env" });
(0, db_1.connectDB)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Mount routers
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/subscriptions", subscriptions_1.default);
app.use("/api/v1/categories", categories_1.default);
app.get("/", (req, res) => {
    res.send("Express + Typescript Server");
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});

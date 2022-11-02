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
exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateDetails = exports.logout = exports.getMe = exports.confirmEmail = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = require("../models/User");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const crypto_1 = __importDefault(require("crypto"));
// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Plase provide all fields");
    }
    // Test user
    const testUser = yield User_1.User.findOne({ email });
    if (testUser) {
        res.status(400);
        throw new Error("Something went wrong");
    }
    // Create user
    const user = yield User_1.User.create({
        name,
        email,
        password,
    });
    // grab token to send in email
    const confirmEmailToken = user.generateEmailConfirmToken();
    // Create reset url
    // TODO: create env variable with client side url, so we can send that in the email
    const confirmEmailURL = `http://localhost:3000/confirmemail?token=${confirmEmailToken}`;
    const message = `You are receiving this email because you need to confirm your email address. Please visit ${confirmEmailURL} .`;
    user.save({ validateBeforeSave: false });
    yield (0, sendEmail_1.default)({
        email: user.email,
        subject: "Email confirmation",
        message,
    });
    sendTokenResponse(user, 200, res);
}));
exports.register = register;
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate email & password
    if (!email || !password) {
        res.status(400);
        throw new Error("Email & password required");
    }
    // Check user
    const user = yield User_1.User.findOne({ email }).select("+password");
    if (!user) {
        res.status(400);
        throw new Error("Invalid credentials");
    }
    // Check if password matches
    const isMatch = yield user.matchPassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    sendTokenResponse(user, 200, res);
}));
exports.login = login;
// @desc    Confirm email
// @route   GET /api/v1/auth/confirmemail
// @access  Public
const confirmEmail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    if (!token) {
        res.status(400);
        throw new Error("Invalid token");
    }
    const splitToken = token.split(".")[0];
    const confirmEmailToken = crypto_1.default
        .createHash("sha256")
        .update(splitToken)
        .digest("hex");
    //get user by token
    const user = yield User_1.User.findOne({
        confirmEmailToken,
        isEmailConfirmed: false,
    });
    if (!user) {
        res.status(400);
        throw new Error("Invalid token");
    }
    //update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;
    //save
    user.save({ validateBeforeSave: false });
    //return token
    sendTokenResponse(user, 200, res);
}));
exports.confirmEmail = confirmEmail;
// Get loggedin user from the req, wich is set by the protectedRoute middleware
const getMe = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    res.status(200).json({
        success: true,
        data: user,
    });
}));
exports.getMe = getMe;
// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        data: {},
    });
}));
exports.logout = logout;
// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
const updateDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };
    const userFromReq = req.user;
    if (!userFromReq) {
        res.status(400);
        throw new Error("Not logged in");
    }
    const user = yield User_1.User.findByIdAndUpdate(userFromReq.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: user,
    });
}));
exports.updateDetails = updateDetails;
// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
const updatePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select("+password");
    if (!user) {
        res.status(500);
        throw new Error("Not authorized");
    }
    // Check current password
    if (!(yield user.matchPassword(req.body.currentPassword))) {
        res.status(400);
        throw new Error("Password is incorrect");
    }
    user.password = req.body.newPassword;
    yield user.save();
    sendTokenResponse(user, 200, res);
}));
exports.updatePassword = updatePassword;
// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
const forgotPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({ email: req.body.email });
    if (!user) {
        res.status(401);
        throw new Error("There is no user with this email");
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    yield user.save({ validateBeforeSave: false });
    // Create reset url
    //const resetUrl = `${req.protocol}://${req.get(
    // "host"
    //)}/api/v1/auth/resetpassword/${resetToken}`;
    //TODO: add global variable for client url and replace below
    const resetUrl = `http://localhost:3000/resetpassword?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit ${resetUrl}`;
    try {
        yield (0, sendEmail_1.default)({
            email: user.email,
            subject: "Password reset token",
            message,
        });
        res.status(200).json({ success: true, data: "Email sent" });
    }
    catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save({ validateBeforeSave: false });
        //return next(new ErrorResponse("Email could not be sent", 500));
        next();
        throw new Error("Email could not be sent");
    }
}));
exports.forgotPassword = forgotPassword;
// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
const resetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get hashed token
    console.log(req.params.resettoken);
    const resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");
    const user = yield User_1.User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        //return next(new ErrorResponse("Invalid token", 400));
        res.status(400);
        next("Invalid token");
        throw new Error("Invalid token");
    }
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    yield user.save();
    sendTokenResponse(user, 200, res);
}));
exports.resetPassword = resetPassword;
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };
    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }
    res.status(statusCode).cookie("token", token, options).json({
        cussess: true,
        token,
    });
};

import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User, IUserMethods } from "../models/User";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(
  async (
    req: Request<
      never,
      never,
      { name: string; email: string; password: number }
    >,
    res: Response
  ) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Plase provide all fields");
    }

    // Test user
    const testUser = await User.findOne({ email });

    if (testUser) {
      res.status(400);
      throw new Error("Something went wrong");
    }

    // Create user
    const user = await User.create({
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

    await sendEmail({
      email: user.email,
      subject: "Email confirmation",
      message,
    });

    sendTokenResponse(user, 200, res);
  }
);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(
  async (
    req: Request<never, never, { email: string; password: string }>,
    res: Response
  ) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400);
      throw new Error("Email & password required");
    }

    // Check user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400);
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    sendTokenResponse(user, 200, res);
  }
);

// @desc    Confirm email
// @route   GET /api/v1/auth/confirmemail
// @access  Public
const confirmEmail = asyncHandler(
  async (
    req: Request<never, never, never, { token: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.query;

    if (!token) {
      res.status(400);
      throw new Error("Invalid token");
    }

    const splitToken = token.split(".")[0];
    const confirmEmailToken = crypto
      .createHash("sha256")
      .update(splitToken)
      .digest("hex");

    //get user by token
    const user = await User.findOne({
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
  }
);

// Get loggedin user from the req, wich is set by the protectedRoute middleware
const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
const updateDetails = asyncHandler(
  async (
    req: Request<never, never, { name: string; email: string }, never>,
    res: Response
  ) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const userFromReq = req.user;

    if (!userFromReq) {
      res.status(400);
      throw new Error("Not logged in");
    }

    const user = await User.findByIdAndUpdate(userFromReq.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
const updatePassword = asyncHandler(
  async (
    req: Request<
      never,
      never,
      { currentPassword: string; newPassword: string },
      never
    >,
    res: Response
  ) => {
    const user = await User.findById(req.user?.id).select("+password");
    if (!user) {
      res.status(500);
      throw new Error("Not authorized");
    }
    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      res.status(400);
      throw new Error("Password is incorrect");
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(401);
    throw new Error("There is no user with this email");
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  //const resetUrl = `${req.protocol}://${req.get(
  // "host"
  //)}/api/v1/auth/resetpassword/${resetToken}`;

  //TODO: add global variable for client url and replace below
  const resetUrl = `http://localhost:3000/resetpassword?token=${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    //return next(new ErrorResponse("Email could not be sent", 500));
    next();
    throw new Error("Email could not be sent");
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
const resetPassword = asyncHandler(async (req: Request, res, next) => {
  // Get hashed token
  console.log(req.params.resettoken);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
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
  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (
  user: IUserMethods,
  statusCode: number,
  res: Response
) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
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

export {
  register,
  login,
  confirmEmail,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
};

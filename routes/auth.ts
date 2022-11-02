import express from "express";
import {
  register,
  login,
  logout,
  confirmEmail,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";
import { protectedRoute } from "../middleware/auth";

const router = express.Router();

//router.post("/", register);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/confirmemail").get(confirmEmail);
router.route("/updatedetails").put(protectedRoute, updateDetails);
router.route("/updatepassword").put(protectedRoute, updatePassword);
router.route("/me").get(protectedRoute, getMe);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);

export default router;

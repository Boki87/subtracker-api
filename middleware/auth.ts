import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User";

interface TokenInterface {
  id: string;
}

const protectedRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      res.status(400);
      throw new Error("Not authorized to access this route");
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as TokenInterface;
      //set user on req object
      req.user = await User.findById(decoded.id);
      next();
    } catch (e) {
      res.status(400);
      throw new Error("Not authorized, no token");
    }
  }
);

export { protectedRoute };

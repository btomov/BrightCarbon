import { Request, Response } from "express";
import { User } from "../models";
import { handleError } from "../utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-placeholder";
const SALT_ROUNDS = 10;

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const user = new User({ username, email, passwordHash });
      await user.save();

      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      handleError(res, error);
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "1h",
        },
      );

      res.json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      handleError(res, error);
    }
  },
};

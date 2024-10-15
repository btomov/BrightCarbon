import { authController } from "../controllers";
import { Router, Request, Response } from "express";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  await authController.register(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
  await authController.login(req, res);
});

export const authRoutes = router;

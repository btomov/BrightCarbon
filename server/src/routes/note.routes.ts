import { Router, Response } from "express";
import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";
import { noteController } from "../controllers";

const router = Router();

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.getAllNotes(req, res);
});

router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.getNoteById(req, res);
});

router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.createNote(req, res);
});

router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.updateNote(req, res);
});

router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.deleteNote(req, res);
});

router.put("/:id/archive", async (req: AuthenticatedRequest, res: Response) => {
  await noteController.archiveNote(req, res);
});

export const noteRoutes = router;

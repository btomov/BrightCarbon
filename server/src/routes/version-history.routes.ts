import { versionHistoryController } from "../controllers";
import { Router, Response } from "express";
import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";

const router = Router();

router.get("/:noteId", async (req: AuthenticatedRequest, res: Response) => {
  await versionHistoryController.getVersions(req, res);
});

router.put(
  "/:noteId/:versionId/restore",
  async (req: AuthenticatedRequest, res: Response) => {
    await versionHistoryController.restoreVersion(req, res);
  },
);

router.delete("/:noteId", async (req: AuthenticatedRequest, res: Response) => {
  await versionHistoryController.deleteVersions(req, res);
});

export const versionHistoryRoutes = router;

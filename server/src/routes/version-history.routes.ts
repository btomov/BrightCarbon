import { Router, Request, Response } from 'express';
import { VersionHistory } from '../models';
import { handleError } from '../utils';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { noteId, version, content } = req.body;
    const versionHistory = new VersionHistory({ noteId, version, content });
    await versionHistory.save();
    res.status(201).json(versionHistory);
  } catch (error) {
    handleError(res, error) 
  }
});

export default router;

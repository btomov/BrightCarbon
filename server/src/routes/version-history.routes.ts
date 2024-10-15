import { Router, Response } from 'express';
import { VersionHistory, Note } from '../models';
import { handleError } from '../utils';
import { AuthenticatedRequest } from 'types/auth/AuthenticatedRequest.interface';

const router = Router();

router.get('/:noteId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const versions = await VersionHistory.find({ noteId: req.params.noteId });

    if (!versions.length) {
      res.status(404).json({ error: 'No versions found for the specified note' });
      return;
    }

    res.json(versions);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/:noteId/:versionId/restore', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const version: VersionHistory | null = await VersionHistory.findById(req.params.versionId).lean();

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    const note = await Note.findOne({ _id: version.noteId, userId: req.user?.userId });

    if (!note) {
      res.status(404).json({ error: 'Note not found for this user' });
      return;
    }

    note.title = version.title;
    note.content = version.content;
    note.tags = version.tags;
    note.isArchived = version.isArchived;
    note.version = version.version
    await note.save();

    await VersionHistory.deleteOne({ _id: version._id });

    res.status(200).json({ message: 'Note restored successfully', note });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/:noteId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await VersionHistory.deleteMany({ noteId: req.params.noteId });

    if (!result.deletedCount) {
      res.status(404).json({ error: 'No versions found to delete' });
      return;
    }

    res.status(200).json({ message: 'All versions deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
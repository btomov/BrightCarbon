import { Response } from 'express';
import { VersionHistory, Note } from '../models';
import { handleError } from '../utils';
import { AuthenticatedRequest } from 'types/auth/AuthenticatedRequest.interface';

export const versionHistoryController = {
  async getVersions(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const versions = await VersionHistory.find({ noteId: req.params.noteId });

      if (!versions.length) {
        return res.status(404).json({ error: 'No versions found for the specified note' });
      }

      return res.json(versions);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async restoreVersion(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const version = await VersionHistory.findById(req.params.versionId).lean();

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const note = await Note.findOne({ _id: version.noteId, userId: req.user?.userId });

      if (!note) {
        return res.status(404).json({ error: 'Note not found for this user' });
      }

      note.title = version.title;
      note.content = version.content;
      note.tags = version.tags;
      note.isArchived = version.isArchived;
      note.version = version.version;
      await note.save();

      await VersionHistory.deleteOne({ _id: version._id });

      return res.status(200).json({ message: 'Note restored successfully', note });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async deleteVersions(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const result = await VersionHistory.deleteMany({ noteId: req.params.noteId });

      if (!result.deletedCount) {
        return res.status(404).json({ error: 'No versions found to delete' });
      }

      return res.status(200).json({ message: 'All versions deleted successfully' });
    } catch (error) {
      return handleError(res, error);
    }
  }
};

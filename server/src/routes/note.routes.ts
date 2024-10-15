import { Router, Response } from "express";
import { Note, User, VersionHistory } from "../models";
import { handleError } from "../utils";

import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";

const router = Router();

router.get(
  "/",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const notes = await Note.find({ userId: req.user?.userId });

      res.json(notes);
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.get(
  "/:id",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      }).populate("versions");

      console.log(note, ' note')

      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }

      if (req.user?.userId !== note.userId.toString()) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.json(note);
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // I don't like this, try and fix
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { title, content, tags } = req.body;
    const note = new Note({ userId: user._id, title, content, tags });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    handleError(res, error);
  }
});

router.put(
  "/:id",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const note = await Note.findById(req.params.id).lean();

      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }

      const { title, content, tags, isArchived } = req.body;
      const updatedNote: Note = {
        ...note,
        title: title ?? note.title,
        content: content ?? note.content,
        tags: tags ?? note.tags,
        isArchived: isArchived ?? note.isArchived,
        version: note.version + 1,
      };

      await Note.updateOne({ _id: req.params.id }, updatedNote, {
        new: true,
        runValidators: true,
      });

      // Insert a version of the original node
      const version = new VersionHistory({
        noteId: note._id,
        title: note.title,
        tags: note.tags,
        version: note.version,
        content: note.content,
      });
      await version.save();

      // Ensure only the last 10 versions are kept
      const versionCount = await VersionHistory.countDocuments({ noteId: note._id });
      if (versionCount > 10) {
        const oldestVersions = await VersionHistory.find({ noteId: note._id }).sort({ createdAt: 1 }).limit(versionCount - 10);
        const oldestVersionIds = oldestVersions.map(v => v._id);
        await VersionHistory.deleteMany({ _id: { $in: oldestVersionIds } });
      }

      res.json(updatedNote);
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Find the note and check permissions in one step
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      });

      if (!note) {
        res.status(404).json({ error: "Note not found for this user" });
        return;
      }

      await Note.deleteOne({ _id: req.params.id });
      await VersionHistory.deleteMany({ noteId: req.params.id });

      res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.put(
  "/:id/archive",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      });

      if (!note) {
        res.status(404).json({ error: "Note not found for this user" });
        return;
      }

      note.isArchived = true;
      await note.save();

      res.status(200).json({ message: "Note archived successfully", note });
    } catch (error) {
      handleError(res, error);
    }
  }
);

export default router;

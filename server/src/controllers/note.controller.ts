import { Response } from "express";
import { Note, User, VersionHistory } from "../models";
import { handleError } from "../utils";
import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";

export const noteController = {
  async getAllNotes(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      const notes = await Note.find({ userId: req.user?.userId });
      return res.json(notes);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getNoteById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      }).populate("versions");

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (req.user?.userId !== note.userId.toString()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      return res.json(note);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async createNote(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { title, content, tags } = req.body;
      const note = new Note({ userId: user._id, title, content, tags });
      await note.save();
      return res.status(201).json(note);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async updateNote(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      const note = await Note.findById(req.params.id).lean();

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      const { title, content, tags, isArchived } = req.body;
      const updatedNote = {
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

      const version = new VersionHistory({
        noteId: note._id,
        title: note.title,
        tags: note.tags,
        version: note.version,
        content: note.content,
      });
      await version.save();

      const versionCount = await VersionHistory.countDocuments({
        noteId: note._id,
      });
      if (versionCount > 10) {
        const oldestVersions = await VersionHistory.find({ noteId: note._id })
          .sort({ createdAt: 1 })
          .limit(versionCount - 10);
        const oldestVersionIds = oldestVersions.map((v) => v._id);
        await VersionHistory.deleteMany({ _id: { $in: oldestVersionIds } });
      }

      return res.json(updatedNote);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async deleteNote(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      });

      if (!note) {
        return res.status(404).json({ error: "Note not found for this user" });
      }

      await Note.deleteOne({ _id: req.params.id });
      await VersionHistory.deleteMany({ noteId: req.params.id });

      return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async archiveNote(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response | void> {
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user?.userId,
      });

      if (!note) {
        return res.status(404).json({ error: "Note not found for this user" });
      }

      note.isArchived = true;
      await note.save();

      return res
        .status(200)
        .json({ message: "Note archived successfully", note });
    } catch (error) {
      return handleError(res, error);
    }
  },
};

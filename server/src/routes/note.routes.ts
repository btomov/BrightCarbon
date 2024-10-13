import { Router, Request, Response } from "express";
import { Note, User, VersionHistory } from "../models";
import { handleError } from "../utils";
import {ObjectId} from 'mongodb';

import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";

const router = Router();

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

router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id).lean();

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    
    const { title, content, tags, isArchived } = req.body;
    const updatedNote: Note = {
      ...note, 
      title: title ?? note.title,
      content: content ?? note.content, 
      tags: tags ?? note.tags,
      isArchived: isArchived ?? note.isArchived,
      version: note.version + 1
    }

    await Note.updateOne({_id: req.params.id}, updatedNote, {new: true, runValidators: true})

    // Insert a version of the original node
    const version = new VersionHistory({
      noteId: note._id,
      title: note.title,
      version: note.version,
      content: note.content,
    });
    await version.save();

    res.json(updatedNote);
  } catch (error) {
    handleError(res, error);
  }
});

router.get(
  "/:id",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // TODO fix
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const note = await Note.findById(req.params.id).populate("versions");

      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      
      if (req.user.userId !== note.userId.toString()) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      res.json(note);
    } catch (error) {
      handleError(res, error);
    }
  }
);

export default router;

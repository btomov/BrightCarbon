import { Response } from "express";
import { Note, User, VersionHistory } from "../../models";
import { handleError } from "../../utils";
import { noteController } from "../../controllers";
import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";

jest.mock("../../models");

describe("Note Controller", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { body: {}, params: {}, user: { userId: "user-id", email: 'test@gmail.com' } };
    res = { status: statusMock, json: jsonMock };
    jest.spyOn(require("../../utils/error-handler.util"), "handleError");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllNotes", () => {
    it("should return all notes", async () => {
      const mockNotes = [{ _id: "note-id", title: "Sample Note" }];
      (Note.find as jest.Mock).mockResolvedValueOnce(mockNotes);

      await noteController.getAllNotes(req as AuthenticatedRequest, res as Response);

      expect(Note.find).toHaveBeenCalledWith({ userId: req.user?.userId });
      expect(jsonMock).toHaveBeenCalledWith(mockNotes);
    });

    it("should handle errors", async () => {
      (Note.find as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await noteController.getAllNotes(req as AuthenticatedRequest, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });

  describe("getNoteById", () => {
    it("should return the note", async () => {
      const mockNote = { _id: "note-id", title: "Sample Note", userId: "user-id", versions: [] };
      const populateMock = jest.fn().mockResolvedValueOnce(mockNote);
      (Note.findOne as jest.Mock).mockReturnValue({ populate: populateMock });

      req.params = { id: "note-id" };

      await noteController.getNoteById(req as AuthenticatedRequest, res as Response);

      expect(populateMock).toHaveBeenCalledWith("versions");
      expect(jsonMock).toHaveBeenCalledWith(mockNote);
    });

    it("should return 404 if the note is not found", async () => {
      const populateMock = jest.fn().mockResolvedValueOnce(null);
      (Note.findOne as jest.Mock).mockReturnValue({ populate: populateMock });

      req.params = { id: "note-id" };

      await noteController.getNoteById(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Note not found" });
    });
  });

  describe("createNote", () => {
    it("should create a note", async () => {
      const mockUser = { _id: "user-id" };
      const mockNote = { _id: "note-id", title: "New Note" };
      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      const saveMock = jest.fn().mockResolvedValue(mockNote);
      (Note as never as jest.Mock).mockImplementation(() => ({
        ...mockNote,
        save: saveMock,
      }));

      req.body = { title: "New Note", content: "Note content", tags: ["tag1"] };

      await noteController.createNote(req as AuthenticatedRequest, res as Response);

      expect(User.findById).toHaveBeenCalledWith("user-id");
      expect(saveMock).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining(mockNote));
    });

    it("should handle unauthorized request", async () => {
      delete req.user;

      await noteController.createNote(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("deleteNote", () => {
    it("should delete the note", async () => {
      const mockNote = { _id: "note-id", userId: "user-id" };
      (Note.findOne as jest.Mock).mockResolvedValueOnce(mockNote);
      (Note.deleteOne as jest.Mock).mockResolvedValue({});
      (VersionHistory.deleteMany as jest.Mock).mockResolvedValue({});

      req.params = { id: "note-id" };

      await noteController.deleteNote(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Note deleted successfully" });
    });

    it("should return 404 if the note is not found", async () => {
      (Note.findOne as jest.Mock).mockResolvedValueOnce(null);

      req.params = { id: "note-id" };

      await noteController.deleteNote(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Note not found for this user" });
    });
  });

  describe("updateNote", () => {
    it("should update the note", async () => {
      const mockNote = {
        _id: "note-id",
        title: "Old Title",
        content: "Old Content",
        tags: ["old-tag"],
        version: 1,
        userId: "user-id",
      };
      const updatedNote = {
        ...mockNote,
        title: "New Title",
        content: "New Content",
        version: 2,
      };
  
      const leanMock = jest.fn().mockResolvedValueOnce(mockNote);
      (Note.findById as jest.Mock).mockReturnValue({ lean: leanMock });
  
      (Note as never as jest.Mock).mockImplementation(() => ({
        ...updatedNote,
        save: jest.fn().mockResolvedValue(updatedNote),
      }));
  
      const saveVersionHistoryMock = jest.fn().mockResolvedValue({});
      (VersionHistory as never as jest.Mock).mockImplementation(() => ({
        save: saveVersionHistoryMock,
      }));
  
      req.params = { id: "note-id" };
      req.body = { title: "New Title", content: "New Content" };
  
      await noteController.updateNote(req as AuthenticatedRequest, res as Response);
  
      expect(Note.findById).toHaveBeenCalledWith("note-id");
      expect(leanMock).toHaveBeenCalled();
      expect(Note.updateOne).toHaveBeenCalledWith(
        { _id: "note-id" },
        expect.objectContaining({
          title: "New Title",
          content: "New Content",
          version: 2,
        }),
        { new: true, runValidators: true }
      );
      expect(saveVersionHistoryMock).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining(updatedNote));
    });
  
    it("should return 404 if the note is not found", async () => {
      const leanMock = jest.fn().mockResolvedValueOnce(null);
      (Note.findById as jest.Mock).mockReturnValue({ lean: leanMock });
  
      req.params = { id: "note-id" };
  
      await noteController.updateNote(req as AuthenticatedRequest, res as Response);
  
      expect(leanMock).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Note not found" });
    });
  
    it("should handle errors", async () => {
      const leanMock = jest.fn().mockRejectedValueOnce(new Error("Error"));
      (Note.findById as jest.Mock).mockReturnValue({ lean: leanMock });
  
      req.params = { id: "note-id" };
  
      await noteController.updateNote(req as AuthenticatedRequest, res as Response);
  
      expect(leanMock).toHaveBeenCalled();
      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });
  
  describe("archiveNote", () => {
    it("should archive the note", async () => {
      const mockNote = {
        _id: "note-id",
        title: "Old Title",
        content: "Old Content",
        tags: ["old-tag"],
        userId: "user-id",
        isArchived: false,
      };
  
      (Note.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockNote,
        save: jest.fn().mockResolvedValue({ ...mockNote, isArchived: true }), 
      });
  
      req.params = { id: "note-id" };
  
      await noteController.archiveNote(req as AuthenticatedRequest, res as Response);
  
      expect(Note.findOne).toHaveBeenCalledWith({ _id: "note-id", userId: req.user?.userId });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Note archived successfully",
        note: expect.objectContaining({ isArchived: true }),
      });
    });
  
    it("should return 404 if the note is not found", async () => {
      (Note.findOne as jest.Mock).mockResolvedValueOnce(null);
  
      req.params = { id: "note-id" };
  
      await noteController.archiveNote(req as AuthenticatedRequest, res as Response);
  
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Note not found for this user" });
    });
  
    it("should handle errors", async () => {
      (Note.findOne as jest.Mock).mockRejectedValueOnce(new Error("Error"));
  
      req.params = { id: "note-id" };
  
      await noteController.archiveNote(req as AuthenticatedRequest, res as Response);
  
      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });
});

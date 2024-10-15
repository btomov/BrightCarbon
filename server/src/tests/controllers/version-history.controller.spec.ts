import { VersionHistory, Note } from "../../models";
import { versionHistoryController } from "../../controllers";
import { handleError } from "../../utils";
import { AuthenticatedRequest } from "types/auth/AuthenticatedRequest.interface";
import { Response } from "express";

jest.mock("../../models");

describe("versionHistoryController", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { params: { noteId: "note-id", versionId: "version-id" }, user: { userId: "user-id", email: "test@gmail.com" } };
    res = { status: statusMock, json: jsonMock };

    jest.spyOn(require("../../utils/error-handler.util"), "handleError");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getVersions", () => {
    it("should return versions for a note", async () => {
      const mockVersions = [
        { _id: "version-1", noteId: "note-id", version: 1 },
        { _id: "version-2", noteId: "note-id", version: 2 },
      ];
      (VersionHistory.find as jest.Mock).mockResolvedValueOnce(mockVersions);

      await versionHistoryController.getVersions(req as AuthenticatedRequest, res as Response);

      expect(VersionHistory.find).toHaveBeenCalledWith({ noteId: req.params?.noteId });
      expect(jsonMock).toHaveBeenCalledWith(mockVersions);
    });

    it("should return 404 if no versions are found", async () => {
      (VersionHistory.find as jest.Mock).mockResolvedValueOnce([]);

      await versionHistoryController.getVersions(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "No versions found for the specified note" });
    });

    it("should handle errors", async () => {
      (VersionHistory.find as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await versionHistoryController.getVersions(req as AuthenticatedRequest, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });

  describe("restoreVersion", () => {
    it("should restore a version", async () => {
      const mockVersion = {
        _id: "version-id",
        noteId: "note-id",
        title: "Restored Title",
        content: "Restored Content",
        tags: ["restored"],
        version: 2,
        isArchived: false,
      };
      const mockNote = {
        _id: "note-id",
        title: "Old Title",
        content: "Old Content",
        tags: ["old-tag"],
        userId: "user-id",
        save: jest.fn().mockResolvedValue({}),
      };

      (VersionHistory.findById as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(mockVersion),
      });
      (Note.findOne as jest.Mock).mockResolvedValueOnce(mockNote);
      (VersionHistory.deleteOne as jest.Mock).mockResolvedValueOnce({});

      await versionHistoryController.restoreVersion(req as AuthenticatedRequest, res as Response);

      expect(VersionHistory.findById).toHaveBeenCalledWith(req.params?.versionId);
      expect(Note.findOne).toHaveBeenCalledWith({ _id: mockVersion.noteId, userId: req.user?.userId });
      expect(mockNote.save).toHaveBeenCalled();
      expect(VersionHistory.deleteOne).toHaveBeenCalledWith({ _id: mockVersion._id });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Note restored successfully", note: mockNote });
    });

    it("should return 404 if version is not found", async () => {
      (VersionHistory.findById as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null),
      });

      await versionHistoryController.restoreVersion(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Version not found" });
    });

    it("should return 404 if note is not found", async () => {
      const mockVersion = { _id: "version-id", noteId: "note-id" };

      (VersionHistory.findById as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(mockVersion),
      });
      (Note.findOne as jest.Mock).mockResolvedValueOnce(null);

      await versionHistoryController.restoreVersion(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Note not found for this user" });
    });

    it("should handle errors", async () => {
      (VersionHistory.findById as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error("Error")),
      });

      await versionHistoryController.restoreVersion(req as AuthenticatedRequest, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });

  describe("deleteVersions", () => {
    it("should delete all versions for a note", async () => {
      const mockDeleteResult = { deletedCount: 5 };

      (VersionHistory.deleteMany as jest.Mock).mockResolvedValueOnce(mockDeleteResult);

      await versionHistoryController.deleteVersions(req as AuthenticatedRequest, res as Response);

      expect(VersionHistory.deleteMany).toHaveBeenCalledWith({ noteId: req.params?.noteId });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: "All versions deleted successfully" });
    });

    it("should return 404 if no versions are found to delete", async () => {
      const mockDeleteResult = { deletedCount: 0 };

      (VersionHistory.deleteMany as jest.Mock).mockResolvedValueOnce(mockDeleteResult);

      await versionHistoryController.deleteVersions(req as AuthenticatedRequest, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "No versions found to delete" });
    });

    it("should handle errors", async () => {
      (VersionHistory.deleteMany as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await versionHistoryController.deleteVersions(req as AuthenticatedRequest, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, new Error("Error"));
    });
  });
});

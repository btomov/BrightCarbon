import request from "supertest";
import { versionHistoryRoutes } from "../../routes";
import { versionHistoryController } from "../../controllers";
import express from "express";

jest.mock("../../controllers/version-history.controller");

const app = express();
app.use(express.json());
app.use("/versions", versionHistoryRoutes);

describe("Version History Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /versions/:noteId", () => {
    it("should call versionHistoryController.getVersions", async () => {
      const getVersionsMock = jest.fn((req, res) => res.status(200).json([]));
      (versionHistoryController.getVersions as jest.Mock) = getVersionsMock;

      const response = await request(app).get("/versions/noteId");

      expect(versionHistoryController.getVersions).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("PUT /versions/:noteId/:versionId/restore", () => {
    it("should call versionHistoryController.restoreVersion", async () => {
      const restoreVersionMock = jest.fn((req, res) => res.status(200).json({ message: "Version restored" }));
      (versionHistoryController.restoreVersion as jest.Mock) = restoreVersionMock;

      const response = await request(app).put("/versions/noteId/versionId/restore");

      expect(versionHistoryController.restoreVersion).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Version restored" });
    });
  });

  describe("DELETE /versions/:noteId", () => {
    it("should call versionHistoryController.deleteVersions", async () => {
      const deleteVersionsMock = jest.fn((req, res) => res.status(200).json({ message: "Versions deleted" }));
      (versionHistoryController.deleteVersions as jest.Mock) = deleteVersionsMock;

      const response = await request(app).delete("/versions/noteId");

      expect(versionHistoryController.deleteVersions).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Versions deleted" });
    });
  });
});

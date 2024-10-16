import request from "supertest";
import { noteRoutes } from "../../routes";
import { noteController } from "../../controllers";
import express from "express";

jest.mock("../../controllers/note.controller");

const app = express();
app.use(express.json()); 
app.use("/notes", noteRoutes);

describe("Note Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /notes", () => {
    it("should call noteController.getAllNotes", async () => {
      const getAllNotesMock = jest.fn((req, res) => res.status(200).json([]));
      (noteController.getAllNotes as jest.Mock) = getAllNotesMock;

      const response = await request(app).get("/notes");

      expect(noteController.getAllNotes).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /notes/:id", () => {
    it("should call noteController.getNoteById", async () => {
      const getNoteByIdMock = jest.fn((req, res) => res.status(200).json({ id: req.params.id }));
      (noteController.getNoteById as jest.Mock) = getNoteByIdMock;

      const response = await request(app).get("/notes/1");

      expect(noteController.getNoteById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: "1" });
    });
  });

  describe("POST /notes", () => {
    it("should call noteController.createNote", async () => {
      const createNoteMock = jest.fn((req, res) => res.status(201).json({ id: "1", title: "New Note" }));
      (noteController.createNote as jest.Mock) = createNoteMock;

      const response = await request(app)
        .post("/notes")
        .send({ title: "New Note", content: "Note content", tags: ["tag1"] });

      expect(noteController.createNote).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: "1", title: "New Note" });
    });
  });

  describe("PUT /notes/:id", () => {
    it("should call noteController.updateNote", async () => {
      const updateNoteMock = jest.fn((req, res) => res.status(200).json({ id: req.params.id, title: "Updated Note" }));
      (noteController.updateNote as jest.Mock) = updateNoteMock;

      const response = await request(app)
        .put("/notes/1")
        .send({ title: "Updated Note", content: "Updated content" });

      expect(noteController.updateNote).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: "1", title: "Updated Note" });
    });
  });

  describe("DELETE /notes/:id", () => {
    it("should call noteController.deleteNote", async () => {
      const deleteNoteMock = jest.fn((req, res) => res.status(200).json({ message: "Note deleted" }));
      (noteController.deleteNote as jest.Mock) = deleteNoteMock;

      const response = await request(app).delete("/notes/1");

      expect(noteController.deleteNote).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Note deleted" });
    });
  });

  describe("PUT /notes/:id/archive", () => {
    it("should call noteController.archiveNote", async () => {
      const archiveNoteMock = jest.fn((req, res) => res.status(200).json({ message: "Note archived" }));
      (noteController.archiveNote as jest.Mock) = archiveNoteMock;

      const response = await request(app).put("/notes/1/archive");

      expect(noteController.archiveNote).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Note archived" });
    });
  });
});

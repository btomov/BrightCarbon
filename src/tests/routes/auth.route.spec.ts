import request from "supertest";
import { authRoutes } from "../../routes";
import { authController } from "../../controllers";
import express from "express";

jest.mock("../../controllers/auth.controller");

const app = express();
app.use(express.json()); 
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should call authController.register", async () => {
      const registerMock = jest.fn((req, res) => res.status(200).json({ message: "Registered" }));
      (authController.register as jest.Mock) = registerMock;

      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(authController.register).toHaveBeenCalled();
      expect(response.status).toBe(200); 
      expect(response.body).toEqual({ message: "Registered" });
    });
  });

  describe("POST /auth/login", () => {
    it("should call authController.login", async () => {
      const loginMock = jest.fn((req, res) => res.status(200).json({ message: "Logged in" }));
      (authController.login as jest.Mock) = loginMock;

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(authController.login).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged in" });
    });
  });
});

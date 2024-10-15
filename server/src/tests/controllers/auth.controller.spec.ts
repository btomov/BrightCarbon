import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleError } from "../../utils/error-handler.util";
import { authController } from "../../controllers";
import { User } from "../../models";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let saveMock: jest.Mock;
  let findOneMock: jest.Mock;

  const mockUserData = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  };

  const mockUser = {
    _id: "user-id",
    email: mockUserData.email,
    passwordHash: "hashedpassword",
  };

  const createMocks = () => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { body: {} };
    res = { status: statusMock, json: jsonMock };
  };

  beforeEach(() => {
    createMocks();
    saveMock = jest.fn();
    findOneMock = jest.fn();

    jest.spyOn(require("../../utils/error-handler.util"), "handleError");

    jest.spyOn(User.prototype, "save").mockImplementation(saveMock);
    jest.spyOn(User, "findOne").mockImplementation(findOneMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
    });

    it("should register a user successfully", async () => {
      req.body = { ...mockUserData };
      saveMock.mockResolvedValue({});

      await authController.register(req as Request, res as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(saveMock).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: expect.any(Object),
      });
    });

    it("should handle errors during registration", async () => {
      const error = new Error("Registration failed");
      saveMock.mockRejectedValue(error);

      await authController.register(req as Request, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, error);
    });
  });

  describe("login", () => {
    beforeEach(() => {
      (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");
    });

    it("should log in a user successfully", async () => {
      req.body = { email: mockUser.email, password: mockUserData.password };
      findOneMock.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await authController.login(req as Request, res as Response);

      expect(findOneMock).toHaveBeenCalledWith({ email: mockUser.email });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", mockUser.passwordHash);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id, email: mockUser.email },
        expect.any(String),
        { expiresIn: "1h" }
      );
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Login successful",
        token: "mocked-jwt-token",
      });
    });

    it("should return 401 for invalid email or password", async () => {
      req.body = { email: "invalid@example.com", password: "wrongpassword" };
      findOneMock.mockResolvedValue(null);

      await authController.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid email or password" });
    });

    it("should handle errors during login", async () => {
      const error = new Error("Login failed");
      findOneMock.mockRejectedValue(error);

      await authController.login(req as Request, res as Response);

      expect(handleError).toHaveBeenCalledWith(res, error);
    });
  });
});
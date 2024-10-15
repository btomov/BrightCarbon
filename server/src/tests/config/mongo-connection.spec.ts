import mongoose from "mongoose";
import { mongoConnection } from "../../config";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
  connection: {
    get readyState() {
      return 0;
    },
  },
}));

describe("MongoConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = "mongodb://localhost:27017/testdb";
  });

  it("should connect to MongoDB if not already connected", async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce({});
    await mongoConnection.connect();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb", {});
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });

  it("should not connect if MongoDB is already connected", async () => {
    jest.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    await mongoConnection.connect();

    expect(mongoose.connect).not.toHaveBeenCalled();
  });
});

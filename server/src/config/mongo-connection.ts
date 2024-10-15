import mongoose from "mongoose";

class MongoConnection {
  private static instance: MongoConnection;
  private constructor() {}

  // Function to initialize and return the instance
  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  // Function to connect to MongoDB
  public async connect(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 0) {
        const MONGO_URI = process.env.MONGO_URI || "";
        await mongoose.connect(MONGO_URI, {});
        console.log("Connected to MongoDB");
      }
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw new Error("MongoDB connection failed");
    }
  }
}

export const mongoConnection = MongoConnection.getInstance();

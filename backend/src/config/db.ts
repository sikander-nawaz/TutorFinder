import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

const IS_PLACEHOLDER = env.MONGODB_URI.includes("PLACEHOLDER");

export async function connectDB(): Promise<void> {
  if (IS_PLACEHOLDER) {
    logger.warn(
      "MONGODB_URI is a placeholder. Add your real MongoDB Atlas connection string via the Secrets tab. Database features will not work until then."
    );
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error({ err }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    if (env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      logger.warn("Running without database in development mode — DB operations will fail");
    }
  }
}

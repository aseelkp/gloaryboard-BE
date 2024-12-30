import dotenv from "dotenv";
import app from "../src/app.js";
import { connectDB } from "./db/index.js";
import logger from "./services/logger.service.js";



dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Error connecting to database", error);
  });

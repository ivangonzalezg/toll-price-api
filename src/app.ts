import express from "express";
import tollRoutes from "./routes/tolls.routes";
import errorMiddleware from "./middlewares/error.middleware";
import { Database } from "./database";
import morgan from "morgan";

const app = express();

app.use(express.json());

Database.initialize()
  .then(() => console.log("Database connected"))
  .catch((error: any) => console.error("Database connection error:", error));

app.use(morgan("dev"));

app.use("/tolls", tollRoutes);

app.use(errorMiddleware);

export default app;

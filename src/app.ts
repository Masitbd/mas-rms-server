import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middleware/GlobalErrorHandler";
import notFound from "./app/middleware/notFound";
const app: Application = express();

app.use(express.json());
app.use(cors());



app.get("/", (req: Request, res: Response) => {
  res.send("Hello from rms");
});

// ! Global Error handler
app.use(globalErrorHandler);
//Not Found
app.use(notFound);

export default app;

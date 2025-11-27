import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import fs from "fs";
import path from "path";
import { router as transcribeRoute } from "./routes/transcribe";
import { router as diagnoseRoute } from "./routes/diagnose";



const app = express();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
  console.log("Pasta 'uploads' criada automaticamente!");
}


app.use(express.json());


app.use(cors({
  origin: "http://localhost:5173"
}));


app.use("/api/transcribe", transcribeRoute);
app.use("/api/diagnose", diagnoseRoute);

app.listen(3000, () => {
  console.log("Backend rodando na porta 3000");
});

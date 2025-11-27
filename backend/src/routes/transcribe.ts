import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import path from "path";

export const router = express.Router();


const uploadFolder = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}.wav`);
  }
});

const upload = multer({ storage });


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});


router.post("/", upload.single("audio"), async (req, res) => {
  try {
    console.log("Arquivo recebido:", req.file?.path);

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "gpt-4o-transcribe",
    });

    console.log("Transcrição realizada:", transcription.text);

  
    fs.unlink(req.file.path, () => {
      console.log("Arquivo deletado:", req.file?.path);
    });

    return res.json({ text: transcription.text });

  } catch (error) {
    console.error("Erro ao transcrever:", error);
    return res.status(500).json({
      error: "Erro ao transcrever áudio",
      details: error,
    });
  }
});

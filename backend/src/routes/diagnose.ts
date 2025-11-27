import { Router } from "express";
import { generateDiagnosis } from "../services/openai";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Nenhum transcript enviado" });
    }

    // chama o serviço que fala com a OpenAI
    const diagnosis = await generateDiagnosis(transcript);

    // retorna exatamente o que o frontend espera
    res.json(diagnosis);

  } catch (error) {
    console.error("Erro ao gerar diagnóstico:", error);
    res.status(500).json({ error: "Erro ao gerar diagnóstico" });
  }
});

export { router };

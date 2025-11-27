import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateDiagnosis(texto: string) {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
Você é um sistema médico.
RETORNE APENAS JSON PURO SEM QUALQUER TEXTO FORA DO JSON.

Formato obrigatório:
{
  "diagnostico": "",
  "doencas_associadas": [],
  "exames_sugeridos": [],
  "medicamentos": []
}

Texto: "${texto}"
`
    });
    const raw = response.output_text;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (err) {
    console.error("Erro ao parsear JSON do OpenAI:", err);
    throw new Error("Resposta inválida do modelo");
  }
}

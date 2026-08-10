import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

const router: IRouter = Router();

const client = new Anthropic();

const generateRequestSchema = z.object({
  childName: z.string().min(1).max(60),
  childAge: z.number().int().min(0).max(18),
  category: z.string().min(1).max(80),
  theme: z.string().min(1).max(80),
  length: z.string().min(1).max(30),
  idea: z.string().max(400).optional(),
  interests: z.array(z.string().max(60)).max(10).optional(),
});

const storyOutputSchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()),
});

router.post("/stories/generate", async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    return;
  }
  const { childName, childAge, category, theme, length, idea, interests } = parsed.data;

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2048,
      system:
        "Tu es un auteur d'histoires du soir pour enfants, en français. Tu écris des histoires douces, bienveillantes et rassurantes, jamais effrayantes ni violentes, toujours adaptées à l'âge indiqué. L'enfant nommé par l'utilisateur est toujours le héros ou l'héroïne de l'histoire.",
      messages: [
        {
          role: "user",
          content: [
            `Écris une histoire du soir pour ${childName}, ${childAge} ans.`,
            `Catégorie : ${category}`,
            `Thème : ${theme}`,
            `Longueur de lecture visée : ${length}`,
            interests?.length ? `Centres d'intérêt de l'enfant : ${interests.join(", ")}` : null,
            idea ? `Idée particulière à intégrer : ${idea}` : null,
            `L'histoire est écrite à la troisième personne, met ${childName} au centre de l'aventure, et tient en 3 à 5 paragraphes courts. Donne aussi un titre court et évocateur.`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      output_config: { format: zodOutputFormat(storyOutputSchema) },
    });

    if (!response.parsed_output) {
      res.status(502).json({ error: "generation_failed" });
      return;
    }

    res.json(response.parsed_output);
  } catch (err) {
    req.log.error({ err }, "story generation failed");
    res.status(502).json({ error: "generation_failed" });
  }
});

export default router;

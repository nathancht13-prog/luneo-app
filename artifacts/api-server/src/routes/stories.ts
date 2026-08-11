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

const WORDS_PER_MINUTE_READ_ALOUD = 130;

function targetWordCount(lengthLabel: string): number {
  const minutes = Number(lengthLabel.match(/\d+/)?.[0] ?? 8);
  return Math.round(minutes * WORDS_PER_MINUTE_READ_ALOUD);
}

router.post("/stories/generate", async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    return;
  }
  const { childName, childAge, category, theme, length, idea, interests } = parsed.data;

  const words = targetWordCount(length);

  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system:
        "Tu es un auteur d'histoires du soir pour enfants, en français. Tu écris des histoires douces, bienveillantes et rassurantes, jamais effrayantes ni violentes, toujours adaptées à l'âge indiqué. L'enfant nommé par l'utilisateur est toujours le héros ou l'héroïne de l'histoire. Tu respectes précisément la longueur demandée : une histoire trop courte n'est pas acceptable.",
      messages: [
        {
          role: "user",
          content: [
            `Écris une histoire du soir pour ${childName}, ${childAge} ans.`,
            `Catégorie : ${category}`,
            `Thème : ${theme}`,
            interests?.length ? `Centres d'intérêt de l'enfant : ${interests.join(", ")}` : null,
            idea ? `Idée particulière à intégrer : ${idea}` : null,
            `L'histoire est écrite à la troisième personne et met ${childName} au centre de l'aventure.`,
            `Longueur : vise environ ${words} mots au total (soit une lecture à voix haute d'environ ${length}). C'est une longueur cible importante à respecter, ne t'arrête pas prématurément — développe le déroulé, les dialogues et les détails pour l'atteindre naturellement. Répartis le texte sur plusieurs paragraphes réguliers (environ 120 à 180 mots chacun).`,
            `Donne aussi un titre court et évocateur.`,
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

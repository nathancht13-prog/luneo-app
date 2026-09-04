import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { getAuth, clerkClient } from "@clerk/express";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, subscribersTable, storyGenerationsTable } from "@workspace/db";

const router: IRouter = Router();

const client = new OpenAI();

const WORDS_PER_MINUTE_READ_ALOUD = 130;
const FREE_MONTHLY_STORY_LIMIT = 10;

const WORDS_PER_PARAGRAPH = 160;

function targetWordCount(lengthLabel: string): number {
  const numbers = [...lengthLabel.matchAll(/\d+/g)].map((m) => Number(m[0]));
  const minutes = numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 8;
  return Math.round(minutes * WORDS_PER_MINUTE_READ_ALOUD);
}

function targetParagraphCount(words: number): number {
  return Math.max(4, Math.round(words / WORDS_PER_PARAGRAPH));
}

const storyJsonSchema = {
  name: "story",
  strict: true,
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      paragraphs: { type: "array", items: { type: "string" } },
    },
    required: ["title", "paragraphs"],
    additionalProperties: false,
  },
} as const;

router.post("/stories/generate", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses
    .find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?.toLowerCase();

  if (!email) {
    res.status(400).json({ error: "no_email" });
    return;
  }

  const [subscriber] = await db
    .select({ active: subscribersTable.active })
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email));

  if (!subscriber?.active) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [{ count: generatedThisMonth }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(storyGenerationsTable)
      .where(and(eq(storyGenerationsTable.email, email), gte(storyGenerationsTable.createdAt, monthStart)));

    if (generatedThisMonth >= FREE_MONTHLY_STORY_LIMIT) {
      res.status(403).json({ error: "monthly_limit_reached", limit: FREE_MONTHLY_STORY_LIMIT });
      return;
    }
  }

  const {
    childName = "Votre enfant",
    theme = "Aventure",
    childAge = 6,
    category = "Divertissement",
    length = "5-10 minutes",
    idea,
    interests,
  } = req.body as {
    childName?: string;
    theme?: string;
    childAge?: number;
    category?: string;
    length?: string;
    idea?: string;
    interests?: string[];
  };

  const words = targetWordCount(length);
  const paragraphCount = targetParagraphCount(words);

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      response_format: { type: "json_schema", json_schema: storyJsonSchema },
      messages: [
        {
          role: "system",
          content:
            "Tu es un auteur d'histoires du soir pour enfants, en français. Tu écris des histoires douces, bienveillantes et rassurantes, jamais effrayantes ni violentes, toujours adaptées à l'âge indiqué. L'enfant nommé par l'utilisateur est toujours le héros ou l'héroïne de l'histoire. Tu respectes précisément la longueur demandée : une histoire trop courte n'est pas acceptable.",
        },
        {
          role: "user",
          content: [
            `Écris une histoire du soir pour ${childName}, ${childAge} ans.`,
            `Catégorie : ${category}`,
            `Thème : ${theme}`,
            interests?.length ? `Centres d'intérêt de l'enfant : ${interests.join(", ")}` : null,
            idea ? `Idée particulière à intégrer : ${idea}` : null,
            `L'histoire est écrite à la troisième personne et met ${childName} au centre de l'aventure.`,
            `Longueur : vise environ ${words} mots au total (soit une lecture à voix haute d'environ ${length}). C'est une longueur cible importante à respecter, ne t'arrête pas prématurément — développe le déroulé, les dialogues et les détails pour l'atteindre naturellement.`,
            `Structure : exactement ${paragraphCount} paragraphes, ni plus ni moins, de longueur régulière (environ ${Math.round(words / paragraphCount)} mots chacun). Ce nombre de paragraphes est une consigne stricte à respecter précisément.`,
            `Donne aussi un titre court et évocateur.`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    const raw = completion.choices[0]?.message.content;
    if (!raw) {
      res.status(502).json({ error: "generation_failed" });
      return;
    }

    const story = JSON.parse(raw) as { title: string; paragraphs: string[] };
    await db.insert(storyGenerationsTable).values({ email });
    res.json(story);
  } catch (err) {
    req.log.error({ err }, "story generation failed");
    res.status(502).json({ error: "generation_failed" });
  }
});

export default router;

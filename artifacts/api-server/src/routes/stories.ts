import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Mock story templates — to be replaced by real Anthropic API later
const storyTemplates: Record<string, { titles: string[]; paragraphs: (name: string) => string[] }> = {
  Dragons: {
    titles: ["Le dragon et le vœu secret", "La caverne de Flamme", "L'écaille dorée"],
    paragraphs: (name) => [
      `Ce soir-là, ${name} découvrit une grotte illuminée de reflets cuivrés au creux de la montagne. Derrière un rocher moussu, deux yeux dorés brillaient dans l'obscurité.`,
      `C'était Flamme, le plus petit dragon de la forêt, dont les écailles étincelaient comme des braises. « Tu n'as pas peur de moi ? » souffla-t-il, étonné. ${name} secoua la tête en souriant.`,
      `Ensemble, ils s'envolèrent au-dessus des nuages roses du couchant. Le vent caressait leurs joues tandis que les étoiles s'allumaient une à une dans le ciel de velours.`,
      `Quand vint l'heure de rentrer, Flamme déposa délicatement ${name} sur le seuil de la maison. « À demain, ami. » Et ${name} s'endormit le cœur plein d'étoiles.`,
    ],
  },
  Dinosaures: {
    titles: ["Le dinosaure qui tremblait", "À l'ère de ${name}", "Les amis du lac préhistorique"],
    paragraphs: (name) => [
      `Dans une jungle bruissante de fougères géantes, ${name} entendit un grondement inhabituel. En écartant les grandes feuilles, il découvrit un bébé tricératops perdu.`,
      `La petite créature, qu'on appela Tri, avait l'air effrayé. ${name} lui tendit doucement la main, et le dinosaure renifla ses doigts avant de se calmer.`,
      `Ensemble, ils remontèrent la rivière turquoise jusqu'au grand lac où la famille de Tri attendait. Les cris joyeux des dinosaures résonnèrent dans toute la vallée.`,
      `Ce soir-là, blotti près du feu de camp imaginaire, ${name} rêva déjà de la prochaine aventure préhistorique qui l'attendait.`,
    ],
  },
  Espace: {
    titles: ["Le vaisseau des mille étoiles", "La planète arc-en-ciel", "Mission lune de miel"],
    paragraphs: (name) => [
      `Le compte à rebours venait de se terminer. Assis aux commandes de son vaisseau argenté, ${name} souffla un grand coup et appuya sur le bouton vert.`,
      `En quelques secondes, la Terre n'était plus qu'un beau point bleu dans le noir infini. Devant eux s'étendait la galaxie, parsemée de milliers de soleils scintillants.`,
      `Sur la planète Aurélia, des créatures mauves accueillirent ${name} avec des chants mélodieux. Elles lui offrirent un cristal qui luisait doucement dans le creux de sa main.`,
      `Quand le vaisseau se posa enfin sur Terre à l'aube, ${name} glissa le cristal sous son oreiller. La nuit brillerait d'une lueur douce jusqu'à la prochaine aventure.`,
    ],
  },
  default: {
    titles: ["L'aventure du grand soir", "Le chemin des étoiles", "Le secret de la forêt enchantée"],
    paragraphs: (name) => [
      `Ce soir-là était différent des autres. ${name} le sentit au moment même où le soleil se coucha derrière les collines, teintant le ciel d'orange et de rose.`,
      `Un chemin de lumière dorée apparut au milieu du jardin. Chaque pas que faisait ${name} faisait scintiller le sol comme si des milliers de lucioles dormaient juste en dessous.`,
      `Au bout du chemin, une petite porte s'ouvrit sur un monde où les arbres chantonnaient doucement et où les rivières refletaient les constellations.`,
      `Quand ${name} rentra chez lui à la nuit tombée, tout était calme. Il ferma les yeux avec un sourire, sachant que l'aventure l'attendrait encore le lendemain soir.`,
    ],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post("/stories/generate", async (req, res) => {
  const { childName = "Votre enfant", theme = "Aventure" } = req.body as {
    childName?: string;
    theme?: string;
    childAge?: number;
    category?: string;
    length?: string;
    idea?: string;
    interests?: string[];
  };

  // Simulate generation delay
  await new Promise((r) => setTimeout(r, 1200));

  const template = storyTemplates[theme] ?? storyTemplates.default;
  const titleTemplate = pickRandom(template.titles);
  const title = titleTemplate.replace(/\$\{name\}/g, childName);
  const paragraphs = template.paragraphs(childName);

  res.json({ title, paragraphs });
});

export default router;

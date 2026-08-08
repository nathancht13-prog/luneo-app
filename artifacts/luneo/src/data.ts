export type Category = 'Divertissement' | 'Émotions & apprentissage';

export type Story = {
  id: string;
  title: string;
  category: Category;
  theme: string;
  length: string;
  createdAt: string;
  favorite: boolean;
  finished: boolean;
  seriesId?: string;
  episode?: number;
  visual: string;
  paragraphs: string[];
};

export type Series = {
  id: string;
  title: string;
  description: string;
  current: number;
  total: number;
  episodes: string[];
};

export type Child = {
  name: string;
  age: number;
  interests: string[];
  preferences: string[];
  siblings: string;
  reading: string;
};

export const starterChild: Child = {
  name: 'Léo',
  age: 6,
  interests: ['Dinosaures', 'Dragons', 'Espace'],
  preferences: ['Créatures', 'Mystères', 'Amitié'],
  siblings: 'Une petite sœur, Mila',
  reading: 'Avec un parent, avant le coucher',
};

export const series: Series[] = [
  {
    id: 'leoflamme',
    title: 'Les aventures de Léo et Flamme',
    description: 'Un petit dragon, une grande curiosité et des mondes à explorer ensemble.',
    current: 2,
    total: 5,
    episodes: ['La grotte aux lucioles', 'Le secret de la montagne bleue', 'Le jardin dans les nuages', 'La comète qui avait peur', 'Le grand retour à la maison'],
  },
];

export const starterStories: Story[] = [
  {
    id: 'story-lucioles',
    title: 'La grotte aux lucioles',
    category: 'Divertissement',
    theme: 'Amitié',
    length: '5 minutes',
    createdAt: 'Ce soir',
    favorite: true,
    finished: false,
    seriesId: 'leoflamme',
    episode: 1,
    visual: 'visual-ocean',
    paragraphs: [
      'Ce soir-là, Léo suivit Flamme jusqu’à une petite grotte cachée derrière les fougères. À l’intérieur, des centaines de lucioles dessinaient des constellations mouvantes sur les murs.',
      '« Elles cherchent leur chemin », chuchota Flamme. Léo posa sa main sur son cœur et respira doucement. Une lumière vint se poser sur son doigt, puis une autre. Peu à peu, les lucioles se rapprochèrent les unes des autres.',
      'Ensemble, Léo et Flamme guidèrent la nuée vers la sortie. Dehors, les lucioles s’envolèrent dans le ciel et formèrent une nouvelle étoile. Léo sourit : ce soir, il avait découvert que la douceur pouvait aussi être une boussole.',
    ],
  },
  {
    id: 'story-montagne',
    title: 'Le secret de la montagne bleue',
    category: 'Divertissement',
    theme: 'Exploration',
    length: '8 minutes',
    createdAt: 'Hier',
    favorite: true,
    finished: true,
    seriesId: 'leoflamme',
    episode: 2,
    visual: 'visual-night',
    paragraphs: [
      'Au matin, Léo et Flamme aperçurent une montagne bleue qui n’était sur aucune carte. Un sentier de petits cailloux dorés les invitait à monter.',
      'Au sommet dormait une source qui chantait tout bas. Elle ne voulait pas être trouvée par les grands aventuriers, seulement par ceux qui savaient écouter. Léo ferma les yeux et entendit le chant.',
      'La montagne leur offrit une pierre de courage. Léo la glissa dans sa poche : elle brillait chaque fois qu’il osait essayer quelque chose de nouveau.',
    ],
  },
  {
    id: 'story-dino',
    title: 'Léo et le dinosaure qui tremblait',
    category: 'Émotions & apprentissage',
    theme: 'Confiance',
    length: '5 minutes',
    createdAt: 'Il y a 3 jours',
    favorite: false,
    finished: true,
    visual: 'visual-amber',
    paragraphs: [
      'Dans la vallée des fougères, Léo rencontra un petit dinosaure caché sous une feuille. Ses pattes tremblaient devant le grand pont de bois.',
      'Léo ne lui dit pas de ne pas avoir peur. Il s’assit simplement à côté de lui. Ils comptèrent ensemble les planches, une par une, jusqu’à ce que le pont semble un peu moins grand.',
      'Le petit dinosaure fit un pas. Puis un autre. De l’autre côté, il découvrit une clairière pleine de baies sucrées. Léo comprit qu’un courage partagé devient toujours plus léger.',
    ],
  },
  {
    id: 'story-etoile',
    title: 'La petite étoile de Léo',
    category: 'Émotions & apprentissage',
    theme: 'Apaisement',
    length: '3 minutes',
    createdAt: 'Il y a 5 jours',
    favorite: false,
    finished: true,
    visual: 'visual-lilac',
    paragraphs: [
      'Une petite étoile tomba doucement dans la poche de Léo. Elle avait besoin d’un endroit calme pour retrouver son éclat.',
      'Léo lui raconta sa journée, les jeux, les rires et même le moment où tout n’avait pas été facile. À chaque mot, l’étoile brillait un peu plus.',
      'Quand vint l’heure de dormir, Léo la lança dans le ciel. Elle resta juste au-dessus de sa fenêtre, comme une veilleuse rien que pour lui.',
    ],
  },
];

export const themes = ['Aventure', 'Amitié', 'Mystère', 'Dinosaures', 'Espace', 'Émotions', 'Créatures'];
export const interestOptions = ['Dinosaures', 'Dragons', 'Espace', 'Océan', 'Forêt', 'Machines'];
export const preferenceOptions = ['Créatures', 'Mystères', 'Amitié', 'Humour', 'Courage', 'Apaisement'];
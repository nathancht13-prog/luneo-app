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

export type Child = {
  name: string;
  age: number;
  interests: string[];
  preferences: string[];
  siblings: string;
  reading: string;
  companion: string;
};

export const themes = ['Aventure', 'Amitié', 'Mystère', 'Dinosaures', 'Espace', 'Émotions', 'Créatures'];
export const interestOptions = ['Dinosaures', 'Dragons', 'Espace', 'Océan', 'Forêt', 'Machines'];
export const preferenceOptions = ['Créatures', 'Mystères', 'Amitié', 'Humour', 'Courage', 'Apaisement'];
export const companionOptions = ['Chien', 'Chat', 'Lapin', 'Renard', 'Hérisson', 'Ourson', 'Poussin', 'Petit dragon'];
export const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'A no-fuss layout with a single accent color.',
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'A soft colored header with a contemporary feel.',
  },
  {
    id: 'classic',
    name: 'Classic',
    desc: 'A timeless serif design built to print beautifully.',
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'A high-contrast dark band that commands attention.',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    desc: 'Refined gold accents for premium brands.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    desc: 'A signature gradient edge that stands out.',
  },
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

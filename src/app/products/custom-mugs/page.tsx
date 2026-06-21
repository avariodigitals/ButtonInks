import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Custom Mugs',
  subtitle: 'High-quality custom printed mugs for home, office, and gifting. Full-color wrap, dishwasher safe.',
  breadcrumb: 'Custom Mugs',
  wpCategorySlug: 'drinkware-mugs',
  searchFallback: 'mug',
  subCategories: [
    { name: 'Ceramic Mugs',   slug: 'ceramic-mugs',   fallback: 'https://placehold.co/283x350' },
    { name: 'Travel Mugs',    slug: 'travel-mugs',    fallback: 'https://placehold.co/283x350' },
    { name: 'Enamel Mugs',    slug: 'enamel-mugs',    fallback: 'https://placehold.co/283x350' },
    { name: 'Magic Mugs',     slug: 'magic-mugs',     fallback: 'https://placehold.co/283x350' },
    { name: 'Latte Mugs',     slug: 'latte-mugs',     fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Mug Type',    options: ['Ceramic', 'Travel', 'Enamel', 'Magic', 'Latte'] },
    { title: 'Size',        options: ['8oz', '11oz', '15oz', '20oz'] },
    { title: 'Finish',      options: ['Glossy', 'Matte', 'Two-Tone'] },
    { title: 'Price Range', options: ['Under $10', '$10–$20', '$20–$35', '$35+'] },
  ],
};

export default function CustomMugsPage() {
  return <CategoryPageTemplate config={config} />;
}

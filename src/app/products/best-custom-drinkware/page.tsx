import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Drinkware',
  subtitle: 'Custom printed mugs, travel cups, tumblers and more. Full-colour wrap, built to last.',
  breadcrumb: 'Drinkware',
  wpCategorySlug: 'best-custom-drinkware',
  searchFallback: 'mug',
  subCategories: [
    { name: 'Custom Coffee Mugs',   slug: 'custom-coffee-mugs',   fallback: 'https://placehold.co/283x350' },
    { name: 'Personalized Mugs',    slug: 'personalized-mugs',    fallback: 'https://placehold.co/283x350' },
    { name: 'Insulated Travel Mugs',slug: 'insulated-travel-mug', fallback: 'https://placehold.co/283x350' },
    { name: 'Ceramic Photo Mugs',   slug: 'ceramic-photo-mug',    fallback: 'https://placehold.co/283x350' },
    { name: 'Funny Quote Mugs',     slug: 'funny-quote-mug',      fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Type',        options: ['Coffee Mug', 'Travel Mug', 'Tumbler', 'Photo Mug'] },
    { title: 'Size',        options: ['8oz', '11oz', '15oz', '20oz'] },
    { title: 'Finish',      options: ['Glossy', 'Matte', 'Two-Tone'] },
    { title: 'Price Range', options: ['Under $10', '$10–$20', '$20–$35', '$35+'] },
  ],
};

export default function DrinkwarePage() {
  return <CategoryPageTemplate config={config} />;
}

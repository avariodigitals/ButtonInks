import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Custom Stickers',
  subtitle: 'High-quality custom stickers and decals for any use. Durable vinyl, vibrant colors, custom shapes.',
  breadcrumb: 'Stickers',
  wpCategorySlug: 'stickers-labels',
  searchFallback: 'sticker',
  subCategories: [
    { name: 'Die-Cut Stickers',  slug: 'die-cut-stickers',  fallback: 'https://placehold.co/283x350' },
    { name: 'Kiss-Cut Stickers', slug: 'kiss-cut-stickers', fallback: 'https://placehold.co/283x350' },
    { name: 'Clear Stickers',    slug: 'clear-stickers',    fallback: 'https://placehold.co/283x350' },
    { name: 'Bumper Stickers',   slug: 'bumper-stickers',   fallback: 'https://placehold.co/283x350' },
    { name: 'Roll Labels',       slug: 'roll-labels',       fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Sticker Type', options: ['Die-Cut', 'Kiss-Cut', 'Sheet', 'Roll', 'Holographic'] },
    { title: 'Material',     options: ['Vinyl', 'Paper', 'Clear', 'Reflective'] },
    { title: 'Lamination',   options: ['Matte', 'Glossy', 'UV Resistant', 'None'] },
    { title: 'Price Range',  options: ['Under $5', '$5–$15', '$15–$30', '$30+'] },
  ],
};

export default function StickersPage() {
  return <CategoryPageTemplate config={config} />;
}

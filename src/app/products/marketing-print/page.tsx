import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Marketing Print',
  subtitle: 'Professional print marketing materials that get noticed. Business cards, flyers, brochures, and more.',
  breadcrumb: 'Marketing Print',
  wpCategorySlug: 'marketing-prints',
  searchFallback: 'marketing print',
  subCategories: [
    { name: 'Business Cards', slug: 'business-cards',  fallback: 'https://placehold.co/283x350' },
    { name: 'Flyers',         slug: 'flyers',          fallback: 'https://placehold.co/283x350' },
    { name: 'Brochures',      slug: 'brochures',       fallback: 'https://placehold.co/283x350' },
    { name: 'Postcards',      slug: 'postcards',       fallback: 'https://placehold.co/283x350' },
    { name: 'Posters',        slug: 'posters',         fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Product',     options: ['Business Cards', 'Flyers', 'Brochures', 'Postcards', 'Posters', 'Booklets'] },
    { title: 'Paper',       options: ['Standard', 'Premium', 'Recycled', 'Glossy', 'Matte'] },
    { title: 'Turnaround',  options: ['Same Day', 'Next Day', '3–5 Days', '1 Week'] },
    { title: 'Price Range', options: ['Under $20', '$20–$50', '$50–$100', '$100+'] },
  ],
};

export default function MarketingPrintPage() {
  return <CategoryPageTemplate config={config} />;
}

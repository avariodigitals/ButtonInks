import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Print',
  subtitle: 'Professional printing for flyers, brochures, business cards, banners and more. Vibrant colour, fast turnaround.',
  breadcrumb: 'Print',
  wpCategorySlug: 'prints',
  searchFallback: 'print',
  subCategories: [
    { name: 'Photo Prints',  slug: 'photo-prints',  fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Print Type',  options: ['Flyers', 'Brochures', 'Business Cards', 'Posters', 'Photo Prints'] },
    { title: 'Size',        options: ['A6', 'A5', 'A4', 'A3', 'Custom'] },
    { title: 'Finish',      options: ['Glossy', 'Matte', 'Silk', 'Uncoated'] },
    { title: 'Price Range', options: ['Under $20', '$20–$50', '$50–$100', '$100+'] },
  ],
};

export default function PrintsPage() {
  return <CategoryPageTemplate config={config} />;
}

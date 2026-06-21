import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Embroidery',
  subtitle: 'Professional embroidery on polos, caps, jackets, uniforms and more. Crisp detail, lasting quality.',
  breadcrumb: 'Embroidery',
  wpCategorySlug: 'embroidery-uniforms',
  searchFallback: 'embroidery',
  subCategories: [
    { name: 'T-Shirts',      slug: 'custom-t-shirts',  fallback: 'https://placehold.co/283x350' },
    { name: 'Caps & Hats',   slug: 'hats-caps',        fallback: 'https://placehold.co/283x350' },
    { name: 'Polo Shirts',   slug: 'polo-shirts',      fallback: 'https://placehold.co/283x350' },
    { name: 'Hoodies',       slug: 'hoodies',          fallback: 'https://placehold.co/283x350' },
    { name: 'Uniform Sets',  slug: 'uniform-sets',     fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Item Type',   options: ['T-Shirts', 'Polos', 'Caps', 'Hoodies', 'Jackets', 'Bags'] },
    { title: 'Thread',      options: ['Standard', 'Metallic', '3D Puff'] },
    { title: 'Placement',   options: ['Left Chest', 'Center Chest', 'Back', 'Sleeve'] },
    { title: 'Price Range', options: ['Under $15', '$15–$30', '$30–$60', '$60+'] },
  ],
};

export default function EmbroideryPage() {
  return <CategoryPageTemplate config={config} />;
}

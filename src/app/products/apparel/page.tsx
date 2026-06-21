import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Custom Apparel',
  subtitle: 'Premium quality custom t-shirts, hoodies, polos, and more. From high-quality embroidery to vibrant prints.',
  breadcrumb: 'Apparel',
  wpCategorySlug: 'apparel-outerwear',
  searchFallback: 'apparel',
  subCategories: [
    { name: 'T-Shirts',    slug: 'custom-t-shirts',      fallback: 'https://placehold.co/283x350' },
    { name: 'Hoodies',     slug: 'hoodies',              fallback: 'https://placehold.co/283x350' },
    { name: 'Polo Shirts', slug: 'polo-shirts',          fallback: 'https://placehold.co/283x350' },
    { name: 'Outerwear',   slug: 'outerwear',            fallback: 'https://placehold.co/283x350' },
    { name: 'Hats & Caps', slug: 'hats-caps',            fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Apparel Type', options: ['T-Shirts', 'Hoodies', 'Polo Shirts', 'Jackets', 'Activewear', 'Headwear'] },
    { title: 'Gender',       options: ['Men', 'Women', 'Unisex', 'Youth'] },
    { title: 'Material',     options: ['100% Cotton', 'Polyester Blend', 'Tri-Blend', 'Fleece'] },
    { title: 'Price Range',  options: ['Under $15', '$15–$30', '$30–$50', '$50+'] },
  ],
};

export default function ApparelPage() {
  return <CategoryPageTemplate config={config} />;
}

import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Photo Print & Art',
  subtitle: 'Bring your photos and artwork to life. Canvas prints, framed prints, posters, and photo gifts.',
  breadcrumb: 'Photo Print',
  wpCategorySlug: 'photo-prints-art',
  searchFallback: 'photo print',
  subCategories: [
    { name: 'Canvas Prints',  slug: 'canvas-prints',  fallback: 'https://placehold.co/283x350' },
    { name: 'Framed Prints',  slug: 'framed-prints',  fallback: 'https://placehold.co/283x350' },
    { name: 'Posters',        slug: 'posters',        fallback: 'https://placehold.co/283x350' },
    { name: 'Metal Prints',   slug: 'metal-prints',   fallback: 'https://placehold.co/283x350' },
    { name: 'Photo Gifts',    slug: 'photo-gifts',    fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Product',     options: ['Canvas', 'Framed', 'Poster', 'Metal', 'Acrylic', 'Photo Book'] },
    { title: 'Size',        options: ['Small (8x10)', 'Medium (16x20)', 'Large (24x36)', 'Custom'] },
    { title: 'Finish',      options: ['Glossy', 'Matte', 'Satin', 'Lustre'] },
    { title: 'Price Range', options: ['Under $20', '$20–$50', '$50–$100', '$100+'] },
  ],
};

export default function PhotoprintPage() {
  return <CategoryPageTemplate config={config} />;
}

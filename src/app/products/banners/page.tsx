import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Custom Banners',
  subtitle: 'Eye-catching custom banners for events, trade shows, storefronts, and more. Durable, vibrant, and fast.',
  breadcrumb: 'Banners',
  wpCategorySlug: 'banners',
  searchFallback: 'banner',
  subCategories: [
    { name: 'Roll-Up Banners',  slug: 'roll-up-banners',  fallback: 'https://placehold.co/283x350' },
    { name: 'Vinyl Banners',    slug: 'vinyl-banners',    fallback: 'https://placehold.co/283x350' },
    { name: 'Mesh Banners',     slug: 'mesh-banners',     fallback: 'https://placehold.co/283x350' },
    { name: 'Feather Flags',    slug: 'feather-flags',    fallback: 'https://placehold.co/283x350' },
    { name: 'Table Covers',     slug: 'table-covers',     fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Banner Type', options: ['Roll-Up', 'Vinyl', 'Mesh', 'Fabric', 'Feather Flag'] },
    { title: 'Size',        options: ['Small (2x4ft)', 'Medium (3x6ft)', 'Large (4x8ft)', 'Custom'] },
    { title: 'Finish',      options: ['Matte', 'Glossy', 'Satin'] },
    { title: 'Price Range', options: ['Under $30', '$30–$75', '$75–$150', '$150+'] },
  ],
};

export default function BannersPage() {
  return <CategoryPageTemplate config={config} />;
}

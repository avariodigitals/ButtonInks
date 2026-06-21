import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Vehicles Branding',
  subtitle: 'Turn your vehicle into a moving billboard. Full wraps, partial wraps, magnets, and decals.',
  breadcrumb: 'Vehicles Branding',
  wpCategorySlug: 'vehicles-branding',
  searchFallback: 'vehicle wrap',
  subCategories: [
    { name: 'Full Wraps',      slug: 'full-wraps',       fallback: 'https://placehold.co/283x350' },
    { name: 'Partial Wraps',   slug: 'partial-wraps',    fallback: 'https://placehold.co/283x350' },
    { name: 'Car Magnets',     slug: 'car-magnets',      fallback: 'https://placehold.co/283x350' },
    { name: 'Window Graphics', slug: 'window-graphics',  fallback: 'https://placehold.co/283x350' },
    { name: 'Boat Wraps',      slug: 'boat-wraps',       fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Vehicle Type', options: ['Car', 'Truck', 'Van', 'SUV', 'Boat', 'Trailer'] },
    { title: 'Coverage',     options: ['Full Wrap', 'Partial Wrap', 'Decals Only', 'Magnets'] },
    { title: 'Material',     options: ['Cast Vinyl', 'Calendered Vinyl', 'Reflective'] },
    { title: 'Price Range',  options: ['Under $100', '$100–$300', '$300–$700', '$700+'] },
  ],
};

export default function VehiclesBrandingPage() {
  return <CategoryPageTemplate config={config} />;
}

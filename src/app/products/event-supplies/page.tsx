import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Event Supplies',
  subtitle: 'Everything you need to make your event stand out. Custom table covers, tents, flags and more.',
  breadcrumb: 'Event Supplies',
  wpCategorySlug: 'event-supplies',
  searchFallback: 'event',
  subCategories: [
    { name: 'Table Covers',    slug: 'table-covers',     fallback: 'https://placehold.co/283x350' },
    { name: 'Canopy Tents',    slug: 'canopy-tents',     fallback: 'https://placehold.co/283x350' },
    { name: 'Feather Flags',   slug: 'feather-flags',    fallback: 'https://placehold.co/283x350' },
    { name: 'Backdrop Stands', slug: 'backdrop-stands',  fallback: 'https://placehold.co/283x350' },
    { name: 'Name Badges',     slug: 'name-badges',      fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Item Type',   options: ['Table Covers', 'Tents', 'Flags', 'Backdrops', 'Signage'] },
    { title: 'Event Type',  options: ['Trade Show', 'Corporate', 'Wedding', 'Sports', 'Outdoor'] },
    { title: 'Price Range', options: ['Under $30', '$30–$75', '$75–$200', '$200+'] },
  ],
};

export default function EventSuppliesPage() {
  return <CategoryPageTemplate config={config} />;
}

import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Custom Bags',
  subtitle: 'Durable and stylish custom bags for every occasion. From eco-friendly totes to professional backpacks.',
  breadcrumb: 'Bags',
  wpCategorySlug: 'bags-carrying',
  searchFallback: 'bag',
  subCategories: [
    { name: 'Tote Bags',       slug: 'tote-bags',       fallback: 'https://placehold.co/283x350' },
    { name: 'Backpacks',       slug: 'backpacks',        fallback: 'https://placehold.co/283x350' },
    { name: 'Drawstring Bags', slug: 'drawstring-bags',  fallback: 'https://placehold.co/283x350' },
    { name: 'Duffel Bags',     slug: 'duffel-bags',      fallback: 'https://placehold.co/283x350' },
    { name: 'Laptop Sleeves',  slug: 'laptop-sleeves',   fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Bag Type',    options: ['Tote', 'Backpack', 'Drawstring', 'Duffel', 'Messenger'] },
    { title: 'Material',    options: ['Canvas', 'Polyester', 'Nylon', 'Eco-friendly Cotton'] },
    { title: 'Features',    options: ['Zippered', 'Padded', 'Water-resistant', 'Adjustable Straps'] },
    { title: 'Price Range', options: ['Under $10', '$10–$20', '$20–$35', '$35+'] },
  ],
};

export default function BagsPage() {
  return <CategoryPageTemplate config={config} />;
}

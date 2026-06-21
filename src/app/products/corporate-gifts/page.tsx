import CategoryPageTemplate, { CategoryPageConfig } from '@/components/CategoryPageTemplate';

const config: CategoryPageConfig = {
  title: 'Corporate Gifts',
  subtitle: 'Branded corporate gift sets that leave a lasting impression. Perfect for teams, clients, and events.',
  breadcrumb: 'Corporate Gifts',
  wpCategorySlug: 'corporate-gifts',
  searchFallback: 'corporate gift',
  subCategories: [
    { name: 'Gift Sets',       slug: 'gift-sets',         fallback: 'https://placehold.co/283x350' },
    { name: 'Branded Pens',    slug: 'branded-pens',      fallback: 'https://placehold.co/283x350' },
    { name: 'Notebooks',       slug: 'notebooks',         fallback: 'https://placehold.co/283x350' },
    { name: 'USB Drives',      slug: 'usb-drives',        fallback: 'https://placehold.co/283x350' },
    { name: 'Desk Items',      slug: 'desk-items',        fallback: 'https://placehold.co/283x350' },
  ],
  filterGroups: [
    { title: 'Gift Type',   options: ['Gift Sets', 'Writing', 'Tech', 'Drinkware', 'Bags'] },
    { title: 'Recipient',   options: ['Employees', 'Clients', 'Events', 'VIP'] },
    { title: 'Budget',      options: ['Under $10', '$10–$25', '$25–$50', '$50–$100', '$100+'] },
  ],
};

export default function CorporateGiftsPage() {
  return <CategoryPageTemplate config={config} />;
}

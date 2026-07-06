import HeroSection from "@/components/HeroSection";
import BrandsSection from "@/components/BrandsSection";
import ProductCategories from "@/components/ProductCategories";
import NewArrivals from "@/components/NewArrivals";
import FeaturedSellingSection from "@/components/FeaturedSellingSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import SimpleProcess from "@/components/SimpleProcess";
import EnquirySections from "@/components/EnquirySections";
import { getProductCategories, getProducts } from "@/lib/wordpress";

export default async function HomePage() {
  // Fetch data on the server
  const [categories, products] = await Promise.all([
    getProductCategories(),
    getProducts(1, 8) // Fetch first 8 products for arrivals/featured
  ]);

  // Filter root categories for the grid (show all, even empty ones)
  const rootCategories = categories.filter(c => c.parent === 0 && c.slug !== 'uncategorized');

  return (
    <main>
      {/* ① Hero */}
      <HeroSection />

      {/* ② Brands strip */}
      <BrandsSection />

      {/* ③ Product categories - Now Dynamic */}
      <ProductCategories categories={rootCategories} />

      {/* ④ New arrivals - Now Dynamic */}
      <NewArrivals products={products.slice(0, 4)} />

      {/* ⑤ Simple process */}
      <SimpleProcess />

      {/* ⑥ Featured selling products - Now Dynamic */}
      <FeaturedSellingSection products={products.slice(4, 8)} />

      {/* ⑦ Why Choose Us */}
      <WhyChooseUs />

      {/* ⑧ Corporate Sales + Graphics Design Request */}
      <EnquirySections />

      {/* ⑨ Testimonials */}
      <Testimonials />
    </main>
  );
}

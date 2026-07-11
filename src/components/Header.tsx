import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm overflow-x-clip">
      <AnnouncementBar />
      <Navbar />
      <CategoryNav />
    </header>
  );
}

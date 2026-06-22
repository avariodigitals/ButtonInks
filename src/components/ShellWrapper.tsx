"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Routes where the global header/footer should NOT appear
const NO_SHELL_ROUTES = ["/design/review"];

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = NO_SHELL_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  return (
    <>
      {!hideShell && <Header />}
      <div id="shell-main" className={hideShell ? "h-screen overflow-hidden" : "flex-1"}>
        {children}
      </div>
      {!hideShell && <Footer />}
    </>
  );
}

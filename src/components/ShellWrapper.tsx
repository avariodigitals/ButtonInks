"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Routes where the global header/footer should NOT appear
const NO_SHELL_ROUTES = ["/design"];

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = NO_SHELL_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  return (
    <>
      {!hideShell && <Header />}
      <div id="shell-main" className={hideShell ? "overflow-hidden min-w-0" : "flex-1 min-w-0 overflow-x-clip"} style={hideShell ? { height: '100dvh' } : undefined}>
        {children}
      </div>
      {!hideShell && <Footer />}
    </>
  );
}

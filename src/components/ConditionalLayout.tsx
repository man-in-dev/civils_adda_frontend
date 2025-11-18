"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAttemptPage = pathname?.includes("/attempt");

  return (
    <>
      {!isAttemptPage && <Header />}
      {children}
      {!isAttemptPage && <Footer />}
    </>
  );
}


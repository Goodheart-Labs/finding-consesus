import type { Metadata } from "next";
import "../../globals.css";
import { Header } from "@/components/questions/Header";

export const metadata: Metadata = {
  title: "SB 1047 Opinions",
  description: "Find out the trends in SB 1047 opinions",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header className="sticky top-0 z-50" />
      {children}
    </>
  );
}

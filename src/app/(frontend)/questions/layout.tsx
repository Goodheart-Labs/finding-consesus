import type { Metadata } from "next";
import "../../globals.css";
import { Header } from "@/components/questions/Header";
import { FiltersProvider } from "./[slug]/filters";
import { db } from "@/db/client";
import { FilterSelector } from "@/components/filters/selector";

export const metadata: Metadata = {
  title: "SB 1047 Opinions",
  description: "Find out the trends in SB 1047 opinions",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const filters = await db.selectFrom("filters").selectAll().orderBy("id asc").execute();

  return (
    <FiltersProvider>
      <Header className="sticky top-0 backdrop-blur-md z-50">
        <FilterSelector filters={filters} className="hidden sm:flex" />
      </Header>
      {children}
    </FiltersProvider>
  );
}

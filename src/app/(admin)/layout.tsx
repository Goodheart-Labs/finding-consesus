import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { AdminPageNavigation, AdminUserNavigation } from "./navigation";
import { inter } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | SB 1047 Opinions",
  description: "Find out the trends in SB 1047 opinions",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={cn(inter.className, "")}>
      <header className="grid items-center justify-items-center sm:justify-between md:grid-cols-3 gap-2 sm:grid-cols-2 p-4 bg-slate-50">
        <div className="sm:flex gap-2 items-center md:justify-self-start mb-2 sm:mb-0">
          <h1 className="text-xl font-semibold text-center">
            <Link href="/admin">SB 1047 Opinions Admin</Link>
          </h1>
          <Button variant="secondaryRounded" asChild className="hidden lg:flex">
            <Link href="/">Visit Site</Link>
          </Button>
        </div>
        <AdminPageNavigation />
        <div className="sm:justify-self-end sm:col-span-2 md:col-span-1">
          <AdminUserNavigation />
        </div>
      </header>

      <main className="container mx-auto my-10">{children}</main>
    </body>
  );
}

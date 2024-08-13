import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { getBaseUrl, inter } from "@/utils/constants";

export const metadata: Metadata = {
  title: "SB 1047 Opinions",
  metadataBase: new URL(getBaseUrl()),
  description: "Find out the trends in SB 1047 opinions",
  openGraph: {
    images: ["/og-img.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={cn(inter.className, "bg-blue-50 questions-wrapper")}>
      <div className="grid grid-rows-[auto_minmax(0,1fr)] grid-cols-[100%]">{children}</div>
    </body>
  );
}

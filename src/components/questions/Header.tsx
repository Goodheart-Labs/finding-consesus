import { Logo } from "@/assets/Logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Header({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("bg-blue-100 sm:bg-transparent", className)}>
      <div className="px-4 py-5 sm:flex grid gap-2 sm:justify-between sm:items-end sm:container sm:mx-auto">
        <div className="flex-grow fill-white max-w-48 sm:fill-black sm:mt-8">
          <Link href="/" className="fill-black hover:fill-black/60 transition-all flex-grow">
            <Logo />
          </Link>
        </div>
        {children}
      </div>
    </header>
  );
}

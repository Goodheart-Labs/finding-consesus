import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <link rel="favicon" href="/favicon.svg" type="image/svg+xml" />
        {children}
      </html>
    </ClerkProvider>
  );
}

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from "./providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <html>
          <link rel="favicon" href="/favicon.svg" type="image/svg+xml" />
          {children}
        </html>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}

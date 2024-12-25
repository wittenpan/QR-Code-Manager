// app/layout.tsx
import { Toaster } from "./components/ui/toaster";
import { LanguageProvider } from "contexts/language-context";
import "globals.css";

export const metadata = {
  title: "Restaurant QR Menu",
  description: "Digital menu viewing system",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}

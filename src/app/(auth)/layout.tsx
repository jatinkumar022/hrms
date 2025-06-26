import type { Metadata } from "next";
import "../globals.css";
import ReduxProvider from "@/lib/redux-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Your App Title",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <ReduxProvider>
          {/* Your app UI here */}
          {children}
          <Toaster richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}

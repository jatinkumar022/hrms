// app/(auth)/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/lib/redux-provider";
import RouteChangeLoader from "@/components/loaders/RouteEventsListener";
import RouteEventsListener from "@/components/loaders/RouteEventsListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Authentication",
  description: "Login or sign up to your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ReduxProvider>
          <RouteEventsListener />
          <RouteChangeLoader />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <main className="flex items-center justify-center min-h-screen ">
              {children}
            </main>
            <Toaster richColors />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom/Navbar";
import Sidebar from "@/components/custom/Sidebar";
import { ThemeProvider } from "next-themes";
import ReduxProvider from "@/lib/redux-provider";
import "leaflet/dist/leaflet.css";
import AuthInitializer from "@/components/custom/AuthInitializer";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "TalentSync HRMS",
  description:
    "TalentSync HRMS is a modern all-in-one Human Resource Management System that helps businesses streamline attendance, leave, payroll, and employee performance. Empower your HR team with intelligent automation, real-time insights, and seamless employee engagement tools. Synchronize your talent, time, and teams effortlessly.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` ${openSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className={` antialiased h-full`}
        style={{ fontFamily: "var(--font-open-sans), sans-serif" }}
      >
        <ReduxProvider>
          <AuthInitializer />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            {/* Full height flex layout */}
            <div className="flex h-screen overflow-hidden">
              {/* Fixed sidebar */}
              <aside className="hidden md:block w-20 fixed top-0 left-0 h-screen z-20">
                <Sidebar />
              </aside>

              {/* Main content area with left padding for sidebar */}
              <div className="flex-1 flex flex-col md:pl-20">
                {/* Sticky navbar */}
                <Navbar />
                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto">{children}</main>
              </div>
            </div>

            <Toaster richColors />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

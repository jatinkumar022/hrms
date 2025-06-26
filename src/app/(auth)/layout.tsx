import "../globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/lib/redux-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <main className="flex items-center justify-center min-h-screen ">
          {children}
        </main>
        <Toaster richColors />
      </ThemeProvider>
    </ReduxProvider>
  );
}

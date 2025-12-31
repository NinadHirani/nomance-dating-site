import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Navbar } from "@/components/navbar";
import { Header } from "@/components/header";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SparkTrail } from "@/components/spark-trail";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nomance - High Intent Connection",
  description: "Stop swiping, start connecting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <Header />
                <main className="pt-16 pb-16">
                  {children}
                </main>
                  <Navbar />
                  <SparkTrail />
                  <Toaster position="top-center" richColors />
                <VisualEditsMessenger />
              </AuthProvider>
            </ThemeProvider>
          </body>
      </html>
    );

}

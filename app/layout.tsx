import type { Metadata } from "next";
import { Mona_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI powered platform for preparing for diverse interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        monaSans.className,
        "font-mono",
        jetbrainsMono.variable,
        "dark",
      )}
    >
      <body className="min-h-full flex flex-col pattern">
        <main> {children}</main>
        <Toaster position={"top-right"} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { ShukatsuProvider } from "@/hooks/use-shukatsu-store";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "shukatsu-app",
  description: "就職活動の企業、選考、締切を管理する個人用アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className={`${geist.variable} font-sans antialiased`}>
        <ShukatsuProvider>
          <div className="min-h-dvh lg:pl-64">
            <AppHeader />
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-7 sm:px-8 lg:px-12 lg:py-12">
              {children}
            </main>
          </div>
        </ShukatsuProvider>
      </body>
    </html>
  );
}

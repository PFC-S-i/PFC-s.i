import type { Metadata } from "next";

import { AuthProvider } from "@/context/auth.context";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { Toaster } from "@/components";

export const metadata: Metadata = {
  title: "InfoCrypto",
  description: "Notícias do mundo cripto e cotações atualizadas",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground">
        <AuthProvider>
          <div className="min-h-screen flex flex-col px-4 md:px-10 lg:px-20 xl:px-32 max-w-[1920px] mx-auto">
            <Header />

            <main className="flex-1">{children}</main>

            <Footer />
          </div>

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

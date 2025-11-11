import { AuthProvider } from "@/context/auth.context";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { Toaster } from "@/components";

export const metadata = {
  title: "infoCrypto",
  description: "Notícias do mundo da cripto e cotações atualizadas",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="px-4 md:px-10 lg:px-20 xl:px-32 max-w-[1920px] mx-auto bg-background text-foreground">
        <AuthProvider>
          <Header />
          {children}
          {/* <Footer /> */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

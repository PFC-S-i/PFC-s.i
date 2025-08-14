import { Header } from "./components";
import "./globals.css";

export const metadata = {
  title: "PFC S.i",
  description: "Site com notícias, cultura e newsletter",
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
      <body className="bg-gray-50 font-sans text-gray-800">
        <Header />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

const geistSans = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins-regular",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CMS Blog Builder seu negócio online",
  description: "Gerenciamento do blog da Builder seu negócio online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        id="root"
        className={`${geistSans.variable} antialiased`}
      >
        <AuthProvider>
          <ToastContainer autoClose={5000} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
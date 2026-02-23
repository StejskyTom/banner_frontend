import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainSidebar from './components/MainSidebar';

import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Visualy",
  description: "Tvořte widgety snadno a rychle.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body className="min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

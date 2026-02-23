import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "../components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Přihlášení | Visualy",
  description: "Přihlaste se do Visualy a začněte tvořit widgety.",
  openGraph: {
    title: "Přihlášení | Visualy",
    description: "Přihlaste se do Visualy a začněte tvořit widgety.",
    images: [{ url: "/visualy_logo.png" }],
  },
};

export default function AuthLayout({ children }) {
  return (
    <ToastProvider>
      <div className="h-screen">
        {children}
      </div>
    </ToastProvider>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import SidebarWrapper from './SidebarWrapper';
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
  title: {
    default: 'Visualy',
    template: '%s | Visualy',
  },
  description: 'Tvořte widgety snadno a rychle.',
};

export default function WidgetLayout({ children }) {
  return (
    <div>
      <ToastProvider>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </ToastProvider>
    </div>
  );
}

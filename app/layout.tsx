import { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";

export const metadata = {
  title: "Bhutan NDI Digital Signature Portal",
  description: "Digital signature service for Bhutan National Digital Identity",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F8FF] min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

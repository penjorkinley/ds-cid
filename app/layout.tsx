import { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";

export const metadata = {
  title: "Bhutan NDI Digital Signature Portal",
  description: "Digital signature service for Bhutan National Digital Identity",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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

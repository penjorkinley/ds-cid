import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Bhutan NDI Digital Signature Portal",
  description: "Digital signature service for Bhutan National Digital Identity",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F8FF]">{children}</body>
    </html>
  );
}

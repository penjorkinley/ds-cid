"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="w-16 h-16 relative">
              <Image
                src="/ndi-logo.jpeg"
                alt="Bhutan NDI Logo"
                fill
                sizes="(max-width: 768px) 100vw, 64px"
                className="object-contain"
              />
            </div>
            <span className="ml-3 text-xl font-semibold text-[#141B29]">
              Bhutan NDI Digital Services
            </span>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/digital-signature-portal"
                className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${
                  pathname === "/digital-signature-portal"
                    ? "border-[#5AC893] text-[#5AC893]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Digital Signature
              </Link>
              <Link
                href="/verification-portal"
                className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${
                  pathname === "/verification-portal"
                    ? "border-[#5AC893] text-[#5AC893]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Verification Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

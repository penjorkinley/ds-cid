"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
              <Image
                src="/ndi-logo.jpeg"
                alt="Bhutan NDI Logo"
                fill
                sizes="(max-width: 768px) 64px, 100vw"
                className="object-contain"
              />
            </div>
            <span className="ml-2 sm:ml-3 text-base sm:text-xl font-semibold text-[#141B29] line-clamp-2 sm:line-clamp-none">
              Bhutan NDI Digital Services
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center">
            <div className="ml-6 flex space-x-8">
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

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#5AC893] hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1 border-t">
          <Link
            href="/digital-signature-portal"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              pathname === "/digital-signature-portal"
                ? "text-[#5AC893] bg-[#5AC893]/10 border-l-4 border-[#5AC893]"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Digital Signature
          </Link>
          <Link
            href="/verification-portal"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              pathname === "/verification-portal"
                ? "text-[#5AC893] bg-[#5AC893]/10 border-l-4 border-[#5AC893]"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Verification Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}

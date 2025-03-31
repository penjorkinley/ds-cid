"use client";

import Image from "next/image";
import { useEffect } from "react";

interface LoadingScreenProps {
  message?: string;
  gifPath?: string; // Path to your custom GIF
}

export default function LoadingScreen({
  gifPath = "/loading-animation.gif",
}: LoadingScreenProps) {
  // Prevent scrolling while loading screen is shown
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="max-w-md w-full flex flex-col items-center p-6 rounded-lg">
        <div className="w-32 h-32 sm:w-40 sm:h-40 relative mb-6">
          <Image
            src={gifPath}
            alt="Loading"
            fill
            sizes="(max-width: 640px) 128px, 160px"
            className="object-contain"
            priority
          />
        </div>
        <p className="text-lg sm:text-xl font-medium text-[#141B29] text-center">
          Processing your request...
        </p>
        <p className="mt-2 text-sm text-gray-600 text-center">
          This may take a few moments. Please don't close the window.
        </p>
      </div>
    </div>
  );
}

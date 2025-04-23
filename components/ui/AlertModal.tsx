"use client";

import React from "react";
import Modal from "@/components/ui/Modal";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "warning" | "error" | "success";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
}: AlertModalProps) {
  // Icon and color based on variant
  const variantStyles = {
    info: {
      iconColor: "text-blue-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      iconColor: "text-yellow-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    error: {
      iconColor: "text-red-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      iconColor: "text-green-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const { iconColor, icon } = variantStyles[variant];

  const ModalFooter = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#5AC893] border border-transparent rounded-md shadow-sm hover:bg-[#4ba578] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5AC893]"
      >
        OK
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={ModalFooter}
      size="sm"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColor}`}>{icon}</div>
        <div className="ml-3">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

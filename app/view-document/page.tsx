"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface DocumentData {
  documentId: string;
  documentHash: string;
  documentUrl: string;
  name: string;
  holderDid: string;
  organizationId: string;
}

export default function ViewDocument() {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get("data");

    if (!data) {
      setError("No document data found");
      return;
    }

    try {
      // Decode Base64 to JSON
      const decodedData = Buffer.from(data, "base64").toString();
      const parsedData = JSON.parse(decodedData);

      setDocumentData(parsedData);
    } catch (err) {
      console.error("Error decoding data:", err);
      setError("Invalid document data");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4">Loading document data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 relative mb-4">
          <Image
            src="/ndi-logo.jpeg"
            alt="Bhutan NDI Digital Signature Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#141B29]">
          Document Details
        </h1>
      </div>

      <dl className="grid grid-cols-1 gap-4 mb-8">
        <div className="border-b pb-2">
          <dt className="font-medium text-gray-500">Document ID</dt>
          <dd className="mt-1 font-mono">{documentData.documentId}</dd>
        </div>

        <div className="border-b pb-2">
          <dt className="font-medium text-gray-500">Document Hash</dt>
          <dd className="mt-1 font-mono break-all">
            {documentData.documentHash}
          </dd>
        </div>

        <div className="border-b pb-2">
          <dt className="font-medium text-gray-500">Name</dt>
          <dd className="mt-1">{documentData.name}</dd>
        </div>

        <div className="border-b pb-2">
          <dt className="font-medium text-gray-500">Holder DID</dt>
          <dd className="mt-1">{documentData.holderDid}</dd>
        </div>

        <div className="border-b pb-2">
          <dt className="font-medium text-gray-500">Organization ID</dt>
          <dd className="mt-1">{documentData.organizationId}</dd>
        </div>
      </dl>

      {/* <div className="flex justify-center">
        <a
          href={documentData.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-[#5AC893] text-white font-medium rounded hover:bg-[#4ba578] transition"
        >
          View Document
        </a>
      </div> */}
    </div>
  );
}

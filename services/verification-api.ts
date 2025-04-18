// services/verification-api.ts
export interface Signatory {
  name: string;
  email: string;
  signedAt: string;
  validSignature: boolean;
  cid?: string;
}

export interface DocumentVerificationResponse {
  documentId: string;
  validSignature: boolean;
  initialHash: string;
  finalHash: string;
  signatories: Signatory[];
  message?: string;
}

interface ErrorResponse {
  error: string;
}

export const verifyDocument = async (
  formData: FormData
): Promise<DocumentVerificationResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents/check-signature`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    // Check if response is an error object with the format {error: string}
    if (!response.ok || (data && "error" in data)) {
      return {
        documentId: "",
        validSignature: false,
        initialHash: "",
        finalHash: "",
        signatories: [],
        message: (data as ErrorResponse).error || "Verification failed",
      };
    }

    return data as DocumentVerificationResponse;
  } catch (error) {
    return {
      documentId: "",
      validSignature: false,
      initialHash: "",
      finalHash: "",
      signatories: [],
      message: error instanceof Error ? error.message : "Verification failed",
    };
  }
};

export interface VerificationApiResponse {
  name: string;
  email: string;
  holderDid: string;
  signature: string | null;
  signedAt: string | null;
  message: string;
}

interface ErrorResponse {
  error: string;
}

export const verifyDocument = async (
  formData: FormData
): Promise<VerificationApiResponse | VerificationApiResponse[]> => {
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
        name: "",
        email: "",
        holderDid: "",
        signature: null,
        signedAt: null,
        message: (data as ErrorResponse).error || "Verification failed",
      };
    }

    return data;
  } catch (error) {
    return {
      name: "",
      email: "",
      holderDid: "",
      signature: null,
      signedAt: null,
      message: error instanceof Error ? error.message : "Verification failed",
    };
  }
};

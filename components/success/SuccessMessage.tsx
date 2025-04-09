import { UploadResponse } from "../../services/ds-api";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  response: UploadResponse;
  emailStatus: string | null;
  onReset: () => void;
}

export default function SuccessMessage({
  response,
  emailStatus,
  onReset,
}: SuccessMessageProps) {
  // Count recipients
  const recipientCount = response.recipients?.length || 0;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success Icon */}
      <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-green-100 rounded-full"></div>
        <CheckCircle size={48} className="text-green-600 z-10" />
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-green-600 mb-3">
        Document Uploaded Successfully
      </h2>

      <p className="text-gray-600 mb-6 max-w-md">
        {recipientCount === 1 ? (
          <>
            Your document has been successfully sent to{" "}
            <span className="font-semibold">
              {response.recipients[0].email}
            </span>
            . They will receive an email with a QR code for document access and
            signature.
          </>
        ) : (
          <>
            Your document has been successfully sent to {recipientCount}{" "}
            recipients. Each recipient will receive an email with a QR code for
            document access and signature.
          </>
        )}
      </p>

      {/* Show recipients list if multiple */}
      {recipientCount > 1 && (
        <div className="w-full max-w-md mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Recipients:</h3>
          <ul className="text-left text-sm space-y-1">
            {response.recipients.map((recipient, index) => (
              <li key={recipient.id} className="flex justify-between">
                <span>{recipient.name}</span>
                <span className="text-gray-500">{recipient.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email status */}
      {emailStatus && (
        <div className="w-full max-w-md mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm">
          {emailStatus}
        </div>
      )}

      {/* Subtle divider */}
      <div className="w-16 h-1 bg-green-200 rounded-full mb-6"></div>

      {/* Upload Another Button */}
      <button
        onClick={onReset}
        type="button"
        className="px-6 py-3 font-medium text-white bg-[#5AC893] rounded-md hover:bg-[#4ba578] transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
      >
        Upload Another Document
      </button>
    </div>
  );
}

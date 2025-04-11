import { UploadResponse } from "../../services/ds-api";
import { CheckCircle, Mail, User } from "lucide-react";

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
  // Sort recipients by order
  const orderedRecipients = [...response.recipients].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );
  const firstRecipient = orderedRecipients[0];
  const remainingRecipients = orderedRecipients.slice(1);
  const recipientCount = orderedRecipients.length;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success Icon */}
      <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-green-100 rounded-full"></div>
        <CheckCircle size={48} className="text-green-600 z-10" />
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-[#5AC893] mb-3">
        Document Uploaded Successfully
      </h2>

      <p className="text-gray-600 mb-6 max-w-md">
        {recipientCount === 1 ? (
          <>
            Your document has been successfully sent to{" "}
            <span className="font-semibold">{firstRecipient.name}</span> for
            signature.
          </>
        ) : (
          <>
            Your document has been sent to{" "}
            <span className="font-semibold">{firstRecipient.name}</span> for the
            first signature.
            {remainingRecipients.length > 0 &&
              ` After they sign, it will be automatically sent to the next recipient in sequence.`}
          </>
        )}
      </p>

      {/* Clean, simple signature flow list */}
      {recipientCount > 0 && (
        <div className="w-full max-w-md mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-[#5AC893]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Signature Flow
            </h3>
          </div>

          {/* Recipients List */}
          <div>
            {orderedRecipients.map((recipient, index) => (
              <div
                key={recipient.id}
                className={`px-4 py-3 flex items-center 
                  ${index === 0 ? "bg-blue-50" : "bg-gray-50"}`}
              >
                {/* Number indicator */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mr-3
                  ${
                    index === 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Recipient name */}
                <div className="flex items-center mr-auto">
                  <User
                    size={16}
                    className="text-gray-500 mr-2 flex-shrink-0"
                  />
                  <span className="font-medium text-gray-800">
                    {recipient.name}
                  </span>
                </div>

                {/* Recipient email */}
                <div className="flex items-center text-gray-500 text-sm ml-3">
                  <Mail size={16} className="mr-2 flex-shrink-0" />
                  <span>{recipient.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email status */}
      {emailStatus && (
        <div className="w-full max-w-md mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm text-center">
          {emailStatus}
        </div>
      )}

      {/* Subtle divider */}
      <div className="w-16 h-1 bg-green-200 rounded-full mb-6"></div>

      {/* Upload Another Button */}
      <button
        onClick={onReset}
        type="button"
        className="px-6 py-3 font-medium text-white bg-[#5AC893] rounded-md hover:bg-[#4ba578] transition-all duration-200 shadow-sm hover:shadow cursor-pointer flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Upload Another Document
      </button>
    </div>
  );
}

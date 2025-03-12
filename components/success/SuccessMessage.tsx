import { UploadResponse } from "../../services/ds-api";
import DocumentDetails from "./DocumentDetails";
import EmailStatus from "./EmailStatus";

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
  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
      <h2 className="text-lg font-semibold text-green-700 mb-2">
        {response.message}
      </h2>

      <DocumentDetails response={response} />
      <EmailStatus status={emailStatus} />

      <button
        onClick={onReset}
        type="button"
        className="px-4 py-2 font-medium text-white bg-[#5AC893] rounded hover:bg-[#4ba578] cursor-pointer"
      >
        Upload Another Document
      </button>
    </div>
  );
}

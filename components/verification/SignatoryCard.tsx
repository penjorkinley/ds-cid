import { VerificationApiResponse } from "@/services/verification-api";

interface SignatoryCardProps {
  signatory: VerificationApiResponse;
  index: number;
}

export default function SignatoryCard({
  signatory,
  index,
}: SignatoryCardProps) {
  const isSigned = !!signatory.signature && !!signatory.signedAt;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Signatory #{index + 1}</h3>
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              isSigned
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isSigned ? "Signed" : "Not Signed"}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Name</h4>
            <p className="mt-1 text-gray-900">{signatory.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-gray-900">{signatory.email}</p>
          </div>
          {/* <div>
            <h4 className="text-sm font-medium text-gray-500">CID</h4>
            <p className="mt-1 text-gray-900 truncate">{signatory.cid}</p>
          </div> */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <p className="mt-1 text-gray-900">{signatory.message}</p>
          </div>
        </div>

        {isSigned && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Signed At</h4>
            <p className="mt-1 text-gray-900">
              {new Date(signatory.signedAt!).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

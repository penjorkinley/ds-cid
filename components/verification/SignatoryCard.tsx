import { Signatory } from "@/services/verification-api";

interface SignatoryCardProps {
  signatory: Signatory;
  index: number;
}

export default function SignatoryCard({
  signatory,
  index,
}: SignatoryCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-3 sm:p-4 border-b">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium">
            Signatory #{index + 1}
          </h3>
          <div
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full whitespace-nowrap ${
              signatory.validSignature
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {signatory.validSignature ? "Valid Signature" : "Invalid Signature"}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-500">
              Name
            </h4>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 break-words">
              {signatory.name}
            </p>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-500">
              Email
            </h4>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 break-words">
              {signatory.email}
            </p>
          </div>

          {signatory.signedAt && (
            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Signed At
              </h4>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900">
                {new Date(signatory.signedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

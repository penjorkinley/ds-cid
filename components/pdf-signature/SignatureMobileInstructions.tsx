import React from "react";

export const MobileInstructions: React.FC = () => {
  return (
    <div className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 md:hidden">
      <strong className="text-blue-700">Tips:</strong>
      <ul className="list-disc ml-5 mt-1 text-blue-600 space-y-1">
        <li>Pinch to zoom in/out on the document</li>
        <li>Tap and hold to drag signature fields</li>
        <li>Tap corners to resize fields</li>
        <li>Use the red × to remove fields</li>
      </ul>
    </div>
  );
};

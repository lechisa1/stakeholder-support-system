import { Loader2 } from "lucide-react";
const DeleteModal = ({
  message,
  onCancel,
  onDelete,
  open,
  isLoading,
}: {
  message: string;
  onCancel: () => void;
  onDelete: () => void;
  open: boolean;
  isLoading: boolean;
}) => {
  if (!open) return null;

  return (
    // Outer layer: clicking here closes modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onCancel}
    >
      {/* Modal Box */}
      <div
        className="bg-white w-[430px] max-w-[90vw] rounded-xl shadow-2xl border border-gray-200 animate-fadeIn p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing on inside click
      >
        {/* Header */}
        <div className="px-4  border-b pb-2 flex items-center gap-2 mb-4 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Confirm Delete
          </h2>
        </div>

        {/* Message */}
        <div className="text-[#094C81]  rounded-lg px-4 py-3 text-base leading-relaxed">
          {message}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium transition"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

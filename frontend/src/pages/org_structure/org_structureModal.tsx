import React, { useState } from "react";

interface AddHierarchyModalProps {
  onClose: () => void;
  onSubmit?: (levels: string[]) => void;
  initialHierarchy?: string;
}

export default function AddHierarchyModal({
  onClose,
  onSubmit,
  initialHierarchy = "",
}: AddHierarchyModalProps) {
  const [levels, setLevels] = useState<string[]>(initialHierarchy ? [initialHierarchy] : [""]);

  const handleChange = (index: number, value: string) => {
    const newLevels = [...levels];
    newLevels[index] = value;
    setLevels(newLevels);
  };

  const addLevel = () => {
    setLevels([...levels, ""]);
  };

  const removeLevel = (index: number) => {
    if (levels.length === 1) return;
    const newLevels = levels.filter((_, i) => i !== index);
    setLevels(newLevels);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(levels.filter((l) => l.trim() !== ""));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-4">
          Add Hierarchy Levels
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {levels.map((level, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={level}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`Level ${index + 1} name`}
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeLevel(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={addLevel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Add Level
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#094C81] text-white rounded hover:bg-[#073954] transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ImageIcon,
} from "lucide-react";
import FileViewer from "../../components/common/FileView";

interface FileItem {
  id: string;
  url: string;
  name: string;
  type: string;
  mime_type?: string;
}

interface FileViewerModalProps {
  files: FileItem[];
  isOpen: boolean;
  onClose: () => void;
  initialFileIndex?: number;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  files,
  isOpen,
  onClose,
  initialFileIndex = 0,
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(initialFileIndex);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);

  const currentFile = files[currentFileIndex];
  const isImageFile =
    currentFile?.type === "image" ||
    currentFile?.mime_type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(currentFile?.url || "");

  // Navigation functions
  const nextFile = () => {
    setCurrentFileIndex((prev) => (prev + 1) % files.length);
  };

  const prevFile = () => {
    setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
  };

  const closeImageModal = () => {
    setModalImageIndex(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalImageIndex((prev) => ((prev || 0) + 1) % files.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalImageIndex(
      (prev) => ((prev || 0) - 1 + files.length) % files.length
    );
  };

  const handleFileSelect = (index: number) => {
    setCurrentFileIndex(index);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main File Viewer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-[#D5E3EC]">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#1E516A]">
                    File Preview
                  </h3>
                  <span className="text-sm text-gray-500">
                    {currentFileIndex + 1} of {files.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleDownload(currentFile.url, currentFile.name)
                    }
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Download file"
                  >
                    <Download className="w-5 h-5 text-[#1E516A]" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-[#1E516A]" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - File List */}
                <div className="w-64 border-r border-[#D5E3EC] bg-gray-50 overflow-y-auto">
                  <div className="p-4">
                    <h4 className="font-semibold text-[#1E516A] mb-3">Files</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <motion.button
                          key={file.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFileSelect(index)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            index === currentFileIndex
                              ? "bg-[#1E516A] text-white"
                              : "bg-white hover:bg-gray-100 text-gray-700"
                          } border border-[#BFD7EA]`}
                        >
                          <div className="flex items-center gap-2">
                            {file.type === "image" ||
                            file.mime_type?.startsWith("image/") ? (
                              <ImageIcon className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col">
                  {/* Navigation for multiple files */}
                  {files.length > 1 && (
                    <div className="flex justify-between items-center p-4 border-b border-[#D5E3EC]">
                      <button
                        onClick={prevFile}
                        disabled={files.length <= 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#1E516A] hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        {currentFile.name}
                      </span>
                      <button
                        onClick={nextFile}
                        disabled={files.length <= 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#1E516A] hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* File Preview */}
                  <div className="flex-1 p-4 overflow-auto">
                    {isImageFile ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in"
                        onClick={() => openImageModal(currentFileIndex)}
                      >
                        <img
                          src={currentFile.url}
                          alt={currentFile.name}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full">
                        <FileViewer fileUrl={currentFile.url} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {modalImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-[95vw] max-h-[95vh] bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={files[modalImageIndex].url}
                alt={`Attachment ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
                onClick={closeImageModal}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Arrows */}
              {files.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-colors"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-colors"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-4 py-2 text-sm">
                {modalImageIndex + 1} / {files.length}
              </div>

              {/* Download Button */}
              <button
                className="absolute top-4 left-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
                onClick={() =>
                  handleDownload(
                    files[modalImageIndex].url,
                    files[modalImageIndex].name
                  )
                }
                title="Download image"
              >
                <Download className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

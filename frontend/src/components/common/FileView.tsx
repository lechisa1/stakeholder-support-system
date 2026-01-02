"use client";

import React, { useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import {
  FileText,
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/cn/button";

export default function FileViewer({ fileUrl }: { fileUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Correct backend port to 4000 and normalize file path
  const normalizedFileUrl = fileUrl;

  // Enhanced file type detection
  const isPdf =
    normalizedFileUrl.toLowerCase().includes(".pdf") ||
    normalizedFileUrl.toLowerCase().includes("application/pdf");
  const isImage =
    /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(normalizedFileUrl) ||
    normalizedFileUrl.toLowerCase().includes("image/");

  console.log("FileViewer Debug:", {
    originalUrl: fileUrl,
    normalizedUrl: normalizedFileUrl,
    isPdf,
    isImage,
  });

  const handlePdfError = (error: any) => {
    console.error("PDF Viewer Error:", error);
    setError(
      "Failed to load PDF. The file might be corrupted or inaccessible."
    );
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error("Image Viewer Error for URL:", normalizedFileUrl);
    setError(
      "Failed to load image. The file might be corrupted or inaccessible."
    );
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handlePdfLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = normalizedFileUrl;
    link.download = normalizedFileUrl.split("/").pop() || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(normalizedFileUrl, "_blank", "noopener,noreferrer");
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
      <p className="text-gray-600">Loading file...</p>
    </div>
  );

  // Error component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-6">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <p className="text-gray-600 mb-4 text-center max-w-md">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </Button>
        <Button
          onClick={handleOpenInNewTab}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4 max-w-md break-all">
        URL: {normalizedFileUrl}
      </p>
    </div>
  );

  if (isPdf) {
    return (
      <div className="h-full max-h-[700px] w-full min-h-[500px] flex flex-col">
        {error ? (
          <ErrorDisplay message={error} />
        ) : (
          <>
            {isLoading && <LoadingSpinner />}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div className={`flex-1 ${isLoading ? "hidden" : "block"}`}>
                <Viewer
                  fileUrl={normalizedFileUrl}
                  onDocumentLoad={handlePdfLoad}
                  onDocumentError={handlePdfError}
                />
              </div>
            </Worker>
          </>
        )}
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex flex-col h-full max-h-[750px] min-h-[500px]">
        {error ? (
          <ErrorDisplay message={error} />
        ) : (
          <>
            {isLoading && <LoadingSpinner />}
            <div
              className={`flex-1 flex justify-center items-center bg-gray-50 ${
                isLoading ? "hidden" : "block"
              }`}
            >
              <img
                src={normalizedFileUrl}
                alt="Document"
                className="max-h-[700px] max-w-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // For other file types (documents, etc.)
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg min-h-[500px] p-6">
      <FileText className="w-20 h-20 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2 text-center text-lg font-medium">
        Preview not available
      </p>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        This file type cannot be previewed in the browser. You can download the
        file or open it in a new tab.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </Button>
        <Button
          onClick={handleOpenInNewTab}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4 max-w-md break-all">
        File: {normalizedFileUrl.split("/").pop()}
      </p>
    </div>
  );
}

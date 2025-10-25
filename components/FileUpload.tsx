
import React, { useState, useCallback } from 'react';
import { UploadIcon, FileIcon } from './icons';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  clearFiles: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, selectedFiles, clearFiles }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      {selectedFiles.length === 0 ? (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-600'}`}
        >
          <UploadIcon className="w-12 h-12 text-gray-400" />
          <p className="mt-2 text-center text-gray-400">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">TXT or DOCX files</p>
          <input
            type="file"
            multiple
            accept=".txt, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="w-full p-4 border border-gray-600 rounded-lg bg-white/5">
          <h3 className="font-semibold text-lg mb-3 text-gray-200">Selected Files:</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center text-sm text-gray-300">
                <FileIcon className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={clearFiles}
            className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear files
          </button>
        </div>
      )}
    </div>
  );
};

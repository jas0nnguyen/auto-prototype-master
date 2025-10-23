/**
 * Document Upload Component
 *
 * Drag-and-drop file upload with preview and validation.
 * Supports JPEG, PNG, and PDF files with size limits.
 */

import { useState } from 'react';
import { Card, Text, Button } from '@sureapp/canary-design-system';

interface DocumentUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

export function DocumentUpload({ onFilesChange, maxFiles = 5, maxSizePerFile = 10 }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_SIZE_BYTES = maxSizePerFile * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and PDF files are allowed`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `${file.name}: File size must be less than ${maxSizePerFile}MB`;
    }
    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Add to files list
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none">
          <div className="text-4xl mb-2">📎</div>
          <Text className="font-medium mb-1">Drop files here or click to upload</Text>
          <Text color="muted" size="sm">
            JPEG, PNG, or PDF (max {maxSizePerFile}MB per file, up to {maxFiles} files)
          </Text>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text color="error" size="sm">
            {error}
          </Text>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Text className="font-medium">Uploaded Files ({files.length}/{maxFiles})</Text>
          {files.map((file, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* File Icon/Preview */}
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-2xl">
                      {getFileIcon(file)}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <Text className="truncate font-medium">{file.name}</Text>
                    <Text color="muted" size="sm">
                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                    </Text>
                  </div>
                </div>

                {/* Remove Button */}
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

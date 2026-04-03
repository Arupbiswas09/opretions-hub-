import React, { useRef } from 'react';
import { Upload, File, X, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { cn } from '../ui/utils';

interface BonsaiFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

export function BonsaiFileUpload({
  onFilesSelected,
  accept,
  multiple = true,
  maxSize,
  className,
}: BonsaiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-stone-300",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-stone-400" />
        </div>
        
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Click to upload
          </button>
          <span className="text-sm text-stone-600"> or drag and drop</span>
        </div>
        
        <p className="text-xs text-stone-500">
          {accept ? `Supported formats: ${accept}` : 'All file types supported'}
          {maxSize && ` (Max ${maxSize}MB)`}
        </p>
      </div>
    </div>
  );
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface BonsaiDocumentListProps {
  documents: DocumentItem[];
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  className?: string;
}

export function BonsaiDocumentList({ documents, onDownload, onDelete, className }: BonsaiDocumentListProps) {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-stone-600" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-stone-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-stone-500" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors"
        >
          <div className="flex-shrink-0">
            {getFileIcon(doc.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-stone-800 text-sm truncate">{doc.name}</h4>
            <p className="text-xs text-stone-500">
              {doc.size} • {doc.uploadedAt}
              {doc.uploadedBy && ` • ${doc.uploadedBy}`}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {onDownload && (
              <button
                onClick={() => onDownload(doc)}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded"
              >
                <Upload className="w-4 h-4 rotate-180" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(doc)}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileUploaded: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded, isLoading }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "קובץ לא נתמך",
        description: "אנא העלה קובץ אקסל בפורמט .xlsx",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    onFileUploaded(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-2 border-dashed border-blue-light">
      <CardContent 
        className={`flex flex-col items-center justify-center p-6 space-y-4 transition-colors
        ${dragActive ? 'bg-blue-gentle' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-4xl text-blue-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1">העלה קובץ אקסל</h3>
          <p className="text-muted-foreground text-sm">
            גרור ושחרר קובץ כאן או לחץ לבחירה
          </p>
          {selectedFile && (
            <p className="mt-2 text-sm font-medium text-primary">
              {selectedFile.name}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={handleButtonClick}
          className="mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'מעבד קובץ...' : 'בחר קובץ אקסל'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploader;

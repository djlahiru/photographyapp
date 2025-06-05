
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone, type FileWithPath } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, X, Loader } from 'react-feather';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadDropzoneProps {
  onFileChange: (file: File | null) => void;
  initialImageUrl?: string;
  className?: string;
  imageClassName?: string;
  label?: string;
}

export function ImageUploadDropzone({
  onFileChange,
  initialImageUrl,
  className,
  imageClassName,
  label = "Drag 'n' drop an image here, or click to select",
}: ImageUploadDropzoneProps) {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Simulated

  useEffect(() => {
    if (initialImageUrl && !file) {
      setPreview(initialImageUrl);
    }
    // Clear preview if initialImageUrl is removed and no file is set
    if (!initialImageUrl && !file) {
      setPreview(null);
    }
  }, [initialImageUrl, file]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        onFileChange(selectedFile);
        // Simulate upload
        // setIsUploading(true);
        // setTimeout(() => setIsUploading(false), 2000);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
  });

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent dropzone click
    setFile(null);
    // If there was an initial image, removing should clear the preview to show the placeholder,
    // unless the onFileChange(null) call leads to initialImageUrl being re-asserted by the parent.
    // For now, simply clearing preview to null is often desired to show placeholder.
    setPreview(null); 
    onFileChange(null);
  };

  const displayPreview = preview || (file ? preview : initialImageUrl); // Prioritize file preview, then initial

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 text-center cursor-pointer hover:border-primary transition-colors relative group flex items-center justify-center', // Ensure flex properties for centering
        isDragActive && 'border-primary bg-primary/10',
        className // This className (e.g. h-32) defines the component's dimensions
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Loader className="h-10 w-10 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : displayPreview ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={displayPreview}
            alt="Preview"
            layout="fill"
            objectFit="contain"
            className={cn("rounded-md", imageClassName)}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7 p-1"
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground">
          <UploadCloud className="h-10 w-10 mb-2" />
          <p className="text-sm">{label}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}
    </div>
  );
}

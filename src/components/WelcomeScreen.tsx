import React, { useState } from 'react';
import type { Tool, URLContext } from '@/types';
import { useSharedFile } from '@/hooks/useSharedFile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WelcomeScreenProps {
  context: URLContext | null;
  onToolSelect: (tool: Tool) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ context }) => {
  const { setSharedFile, setSharedFiles } = useSharedFile();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filesSaved, setFilesSaved] = useState(false);

  // Update shared files when files are uploaded
  React.useEffect(() => {
    if (uploadedFiles.length > 0 && !filesSaved) {
      if (uploadedFiles.length === 1) {
        // Single file - use setSharedFile for compatibility
        const firstFile = uploadedFiles[0].file;
        setSharedFile(firstFile, firstFile.name, 'welcome-screen');
      } else {
        // Multiple files - use setSharedFiles for merge
        setSharedFiles(
          uploadedFiles.map(uf => ({ blob: uf.file, name: uf.file.name })),
          'welcome-screen'
        );
      }
      setFilesSaved(true);
    }
  }, [uploadedFiles, filesSaved, setSharedFile, setSharedFiles]);

  const detectFileType = (file: File): 'pdf' | 'image' | 'word' | 'unknown' => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    return 'unknown';
  };

  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      preview: undefined,
    }));
    setUploadedFiles(newFiles);
    setFilesSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setFilesSaved(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pb-20">
      <div className="container-responsive max-w-4xl py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Secure and Fast PDF Processing
          </h1>
          <p className="text-xl text-muted-foreground">
            Your files are processed locally and never leave your device.
          </p>
        </div>

        {/* First time banner */}
        {context?.isFirstVisit && uploadedFiles.length === 0 && (
          <Card className="mb-8 bg-secondary border-primary/20 animate-slide-down">
            <CardContent className="p-6">
              <p className="text-center text-secondary-foreground">
                Welcome! All processing happens in your browser - your files never leave your device.
              </p>
            </CardContent>
          </Card>
        )}

        {/* File Upload Area */}
        {uploadedFiles.length === 0 ? (
          <div className="animate-fade-in">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200 outline-none
                ${isDragging
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">
                  {isDragging ? '📥' : '📄'}
                </div>

                <div>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    {isDragging ? 'Drop your files here' : 'Upload your files'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Supports: PDF, Images (JPG, PNG), Word documents
                  </p>
                </div>
              </div>
            </div>

            {/* Back to main site button */}
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <a href="/">← Back to main site</a>
              </Button>
            </div>
          </div>
        ) : (
          /* File Preview */
          <div className="animate-fade-in">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Your Files ({uploadedFiles.length})</CardTitle>
                <Button
                  onClick={clearFiles}
                  variant="ghost"
                  size="sm"
                >
                  Clear All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-secondary rounded-lg border"
                    >
                      <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">
                          {detectFileType(uploadedFile.file) === 'pdf' ? '📄' :
                          detectFileType(uploadedFile.file) === 'image' ? '🖼️' : '📝'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-base">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                      </div>
                      <Badge variant={
                        detectFileType(uploadedFile.file) === 'pdf' ? 'default' :
                        detectFileType(uploadedFile.file) === 'image' ? 'secondary' : 'outline'
                      }>
                        {detectFileType(uploadedFile.file)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center w-full">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-lg font-semibold text-primary mb-2">
                    Select a tool from the sidebar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your file is ready to be processed with any tool you choose
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

      </div>

      {/* Footer - always at bottom, aligned with sidebar offset */}
      <div className="fixed bottom-0 left-64 right-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex justify-center items-center gap-6 text-sm">
          <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
            <a href="/blog">📝 Blog</a>
          </Button>
          <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
            <a href="/about">About</a>
          </Button>
          <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
            <a href="/privacy">Privacy</a>
          </Button>
        </div>
      </div>
    </div>
  );
};


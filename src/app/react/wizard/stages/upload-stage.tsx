import { useState, useRef } from 'react';
import { usePlatform } from '../../platform-context';

interface UploadStageProps {
    onUpload: (fileIds: string[]) => void;
    accept?: string;
    multiple?: boolean;
}

export function UploadStage({ onUpload, accept, multiple = false }: UploadStageProps) {
    const { runtime } = usePlatform();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Write to VFS immediately and get UUIDs
        const entries = await Promise.all(
            Array.from(files).map((file) => runtime.vfs.write(file))
        );

        onUpload(entries.map((e) => e.id));
    };

    return (
        <div className="animate-fade-in">
            <h2 className="stage-title">Select Files</h2>
            <p className="stage-description">
                Choose the documents you want to process.
            </p>

            <div
                className={`glass-card drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <span className="drop-zone-icon">📄</span>
                <p className="drop-zone-title">
                    Drop files here or click to upload
                </p>
                <p className="drop-zone-hint">
                    Supports {accept || 'PDF files'}
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept={accept}
                    multiple={multiple}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
        </div>
    );
}

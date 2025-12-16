import React, { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/common/FileUpload';
import { useI18n } from '@/hooks/useI18n';
import { Loader2 } from 'lucide-react';

interface ToolLayoutProps {
    /** Tool title (e.g., "Merge PDF") */
    title: string;
    /** Tool description */
    description: string;
    /** Content to display when no files are uploaded (optional, defaults to FileUpload) */
    uploadContent?: ReactNode;
    /** Main content to display when files ARE uploaded (e.g., file list, previews) */
    children?: ReactNode;
    /** Sidebar/Settings content (optional) */
    settings?: ReactNode;
    /** Action bar content (e.g., "Merge" button) */
    actions?: ReactNode;
    /** Whether the tool has files uploaded */
    hasFiles: boolean;
    /** Whether the tool is currently processing */
    isProcessing?: boolean;
    /** Function to handle file uploads */
    onUpload: (files: File[]) => void;
    /** Whether to replace existing files on upload (vs append) */
    replaceOnUpload?: boolean;
    /** Title for the upload area (overrides default) */
    uploadTitle?: string;
    /** Description for the upload area */
    uploadDescription?: string;
    /** Maximum number of files allowed */
    maxFiles?: number;
    /** Accepted file types (e.g., ".pdf,.jpg") */
    acceptedTypes?: string;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
    title,
    description,
    uploadContent,
    children,
    settings,
    actions,
    hasFiles,
    isProcessing = false,
    onUpload,
    uploadTitle,
    uploadDescription,
    maxFiles,
    acceptedTypes,
}) => {
    const { t } = useI18n();

    return (
        <main id="main-content" className="tool-layout space-y-6 w-full max-w-[98%] mx-auto px-4 md:px-6 py-8 animate-fade-in" role="main">
            {/* Header */}
            <div className="text-center md:text-left space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    {title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                    {description}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    {/* Upload Area (Visible if no files or if we want to allow adding more) */}
                    {!hasFiles && (
                        uploadContent || (
                            <FileUpload
                                onFilesSelected={(files) => onUpload(files)}
                                disabled={isProcessing}
                                multiple={maxFiles !== 1}
                                title={uploadTitle}
                                description={uploadDescription}
                                maxFiles={maxFiles}
                                accept={acceptedTypes}
                            />
                        )
                    )}

                    {/* Tool Workspace (Previews, Lists) */}
                    {hasFiles && (
                        <div className="space-y-4 animate-slide-up">
                            {children}
                        </div>
                    )}
                </div>

                {/* Sidebar / Settings Area (Desktop: Right side, Mobile: Bottom) */}
                {hasFiles && (settings || actions) && (
                    <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
                        {/* Settings Card */}
                        {settings && (
                            <Card className="sticky top-24 glass-premium dark:glass-premium-dark overflow-hidden transition-all duration-300 hover:shadow-glow/20">
                                <CardContent className="p-6 space-y-6">
                                    {settings}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions Card (Process Button) */}
                        {actions && (
                            <Card className={`glass-premium dark:glass-premium-dark border-t-4 transition-all duration-300 ${isProcessing ? 'border-ocean-400 shadow-glow' : 'border-transparent'}`}>
                                <CardContent className="p-6">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center justify-center py-2 space-y-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {t('common.processing')}...
                                            </p>
                                        </div>
                                    ) : (
                                        actions
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

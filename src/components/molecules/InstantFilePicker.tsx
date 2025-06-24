/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { Button, ButtonProps } from '../atoms/Button';
import { useInstantFileSelection } from '../../hooks/useInstantFileSelection';

interface InstantFilePickerProps extends Omit<ButtonProps, 'onClick'> {
  acceptedTypes?: string[];
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

/**
 * InstantFilePicker - A ready-to-use file picker button component
 * 
 * This component combines the Button atom with useInstantFileSelection hook
 * to provide a consistent file selection experience across the app.
 * 
 * @param props Configuration for file selection and button appearance
 */
export const InstantFilePicker: React.FC<InstantFilePickerProps> = ({
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.csv', '.txt', '.tsv'],
  multiple = true,
  maxSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  onFilesSelected,
  onError,
  children = 'Choose Files',
  variant = 'primary',
  icon = Upload,
  disabled,
  ...buttonProps
}) => {
  const { openFileDialog, isSupported } = useInstantFileSelection({
    acceptedTypes,
    multiple,
    maxSize,
    maxFiles,
    onFilesSelected,
    onError
  });

  const isDisabled = disabled || !isSupported;

  return (
    <Button
      variant={variant}
      icon={icon}
      onClick={openFileDialog}
      disabled={isDisabled}
      title={isSupported ? 'Click to select files' : 'File selection not supported'}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

/**
 * Quick action variants for common use cases
 */

// For PDF-only selection
export const PDFFilePicker: React.FC<Omit<InstantFilePickerProps, 'acceptedTypes'>> = (props) => (
  <InstantFilePicker
    acceptedTypes={['.pdf']}
    {...props}
  >
    {props.children || 'Choose PDF Files'}
  </InstantFilePicker>
);

// For image-only selection
export const ImageFilePicker: React.FC<Omit<InstantFilePickerProps, 'acceptedTypes'>> = (props) => (
  <InstantFilePicker
    acceptedTypes={['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']}
    {...props}
  >
    {props.children || 'Choose Images'}
  </InstantFilePicker>
);

// For CSV/data files
export const DataFilePicker: React.FC<Omit<InstantFilePickerProps, 'acceptedTypes'>> = (props) => (
  <InstantFilePicker
    acceptedTypes={['.csv', '.txt', '.tsv']}
    {...props}
  >
    {props.children || 'Choose Data Files'}
  </InstantFilePicker>
);

// For single file selection
export const SingleFilePicker: React.FC<Omit<InstantFilePickerProps, 'multiple' | 'maxFiles'>> = (props) => (
  <InstantFilePicker
    multiple={false}
    maxFiles={1}
    {...props}
  >
    {props.children || 'Choose File'}
  </InstantFilePicker>
);

import { useState, useEffect } from 'react';

interface SharedFile {
  blob: Blob;
  name: string;
  sourceTool: string;
  timestamp: number;
}

interface SharedFiles {
  files: SharedFile[];
  sourceTool: string;
  timestamp: number;
}

// Singleton state for file sharing between tools
let sharedFileState: SharedFile | null = null;
let sharedFilesState: SharedFiles | null = null;
const listeners: Set<(file: SharedFile | null) => void> = new Set();
const filesListeners: Set<(files: SharedFiles | null) => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener(sharedFileState));
};

const notifyFilesListeners = () => {
  filesListeners.forEach(listener => listener(sharedFilesState));
};

export const useSharedFile = () => {
  const [file, setFile] = useState<SharedFile | null>(sharedFileState);
  const [files, setFiles] = useState<SharedFiles | null>(sharedFilesState);

  useEffect(() => {
    const listener = (newFile: SharedFile | null) => {
      setFile(newFile);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    const listener = (newFiles: SharedFiles | null) => {
      setFiles(newFiles);
    };

    filesListeners.add(listener);

    return () => {
      filesListeners.delete(listener);
    };
  }, []);

  const setSharedFile = (blob: Blob, name: string, sourceTool: string) => {
    sharedFileState = {
      blob,
      name,
      sourceTool,
      timestamp: Date.now(),
    };
    notifyListeners();
  };

  const setSharedFiles = (fileList: Array<{ blob: Blob; name: string }>, sourceTool: string) => {
    sharedFilesState = {
      files: fileList.map(f => ({
        blob: f.blob,
        name: f.name,
        sourceTool,
        timestamp: Date.now(),
      })),
      sourceTool,
      timestamp: Date.now(),
    };
    notifyFilesListeners();
  };

  const clearSharedFile = () => {
    sharedFileState = null;
    notifyListeners();
  };

  const clearSharedFiles = () => {
    sharedFilesState = null;
    notifyFilesListeners();
  };

  const getSharedFile = () => {
    return sharedFileState;
  };

  const getSharedFiles = () => {
    return sharedFilesState;
  };

  return {
    sharedFile: file,
    sharedFiles: files,
    setSharedFile,
    setSharedFiles,
    clearSharedFile,
    clearSharedFiles,
    getSharedFile,
    getSharedFiles,
  };
};

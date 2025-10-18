import { useState, useEffect } from 'react';

interface SharedFile {
  blob: Blob;
  name: string;
  sourceTool: string;
  timestamp: number;
}

// Singleton state for file sharing between tools
let sharedFileState: SharedFile | null = null;
const listeners: Set<(file: SharedFile | null) => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener(sharedFileState));
};

export const useSharedFile = () => {
  const [file, setFile] = useState<SharedFile | null>(sharedFileState);

  useEffect(() => {
    const listener = (newFile: SharedFile | null) => {
      setFile(newFile);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
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

  const clearSharedFile = () => {
    sharedFileState = null;
    notifyListeners();
  };

  const getSharedFile = () => {
    return sharedFileState;
  };

  return {
    sharedFile: file,
    setSharedFile,
    clearSharedFile,
    getSharedFile,
  };
};

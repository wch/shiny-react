import { useCallback, useState } from "react";

export function useDragAndDrop() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => prev + 1);

    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsDragOver(false);
        return 0;
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, onFilesDropped?: (files: FileList) => void) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setDragCounter(0);

      const files = e.dataTransfer.files;
      if (files.length > 0 && onFilesDropped) {
        onFilesDropped(files);
      }
    },
    []
  );

  const resetDragState = useCallback(() => {
    setIsDragOver(false);
    setDragCounter(0);
  }, []);

  return {
    isDragOver,
    dragCounter,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetDragState,
  };
}
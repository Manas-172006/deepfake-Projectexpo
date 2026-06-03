/**
 * Custom hook for image upload logic
 * Handles file validation, preview generation, and drag-and-drop state
 */

import { useState, useRef, useCallback } from 'react';

const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const useImageUpload = (onFileSelected) => {
  const [preview, setPreview]       = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError]   = useState(null);
  const [fileInfo, setFileInfo]     = useState(null);
  const fileInputRef                = useRef(null);

  const validateAndProcess = useCallback((file) => {
    if (!file) return;

    setFileError(null);

    if (!VALID_TYPES.includes(file.type)) {
      setFileError('Unsupported format. Please upload JPG, PNG, or WebP.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type.split('/')[1].toUpperCase(),
      });
    };
    reader.readAsDataURL(file);

    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndProcess(e.dataTransfer.files[0]);
  }, [validateAndProcess]);

  const handleInputChange = useCallback((e) => {
    if (e.target.files?.[0]) validateAndProcess(e.target.files[0]);
  }, [validateAndProcess]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setPreview(null);
    setFileError(null);
    setFileInfo(null);
    onFileSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onFileSelected]);

  return {
    preview,
    dragActive,
    fileError,
    fileInfo,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleInputChange,
    handleClick,
    reset,
  };
};

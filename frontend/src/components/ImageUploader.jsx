/**
 * ImageUploader — drag-and-drop upload zone with live preview
 */

import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ImageIcon, X, FileImage, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

const ImageUploader = ({ onImageSelect, isLoading }) => {
  const {
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
  } = useImageUpload(onImageSelect);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* ── Upload Zone ── */}
        {!preview && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`
                relative rounded-2xl border-2 border-dashed p-12 text-center
                transition-all duration-300 cursor-pointer select-none
                ${isLoading
                  ? 'opacity-50 cursor-not-allowed border-white/10'
                  : dragActive
                    ? 'border-cyber-400 bg-cyber-500/8 shadow-cyber'
                    : 'border-white/15 hover:border-cyber-500/50 hover:bg-white/3'
                }
              `}
              onDragEnter={!isLoading ? handleDrag : undefined}
              onDragLeave={!isLoading ? handleDrag : undefined}
              onDragOver={!isLoading ? handleDrag : undefined}
              onDrop={!isLoading ? handleDrop : undefined}
              onClick={!isLoading ? handleClick : undefined}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
                disabled={isLoading}
              />

              {/* Animated icon */}
              <motion.div
                animate={dragActive ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex justify-center mb-5"
              >
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center
                  transition-all duration-300
                  ${dragActive
                    ? 'bg-cyber-500/20 shadow-cyber'
                    : 'bg-white/5 border border-white/10'
                  }
                `}>
                  <UploadCloud className={`w-9 h-9 transition-colors duration-300
                    ${dragActive ? 'text-cyber-300' : 'text-dark-600'}`}
                  />
                </div>
              </motion.div>

              <p className="text-white font-semibold text-lg mb-1">
                {dragActive ? 'Drop it here' : 'Drop image or click to browse'}
              </p>
              <p className="text-dark-700 text-sm">
                JPG · PNG · WebP &nbsp;·&nbsp; Max 10 MB
              </p>

              {/* Corner decorations */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                <div
                  key={pos}
                  className={`absolute ${pos} w-4 h-4 border-cyber-500/30
                    ${pos.includes('top') && pos.includes('left')   ? 'border-t-2 border-l-2' : ''}
                    ${pos.includes('top') && pos.includes('right')  ? 'border-t-2 border-r-2' : ''}
                    ${pos.includes('bottom') && pos.includes('left')  ? 'border-b-2 border-l-2' : ''}
                    ${pos.includes('bottom') && pos.includes('right') ? 'border-b-2 border-r-2' : ''}
                  `}
                />
              ))}
            </div>

            {/* File error */}
            <AnimatePresence>
              {fileError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl
                             bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {fileError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Preview Zone ── */}
        {preview && (
          <motion.div
            key="preview-zone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Image preview */}
            <div className="relative group rounded-2xl overflow-hidden border border-white/10
                            bg-dark-100 shadow-glass">
              <img
                src={preview}
                alt="Selected image preview"
                className="w-full max-h-80 object-contain"
              />

              {/* Scan line overlay on preview */}
              <div className="absolute inset-0 pointer-events-none scan-overlay opacity-40" />

              {/* Remove button */}
              {!isLoading && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full
                             bg-dark-50/90 border border-white/20 text-dark-800
                             flex items-center justify-center
                             opacity-0 group-hover:opacity-100
                             transition-opacity duration-200 hover:text-neon-red"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              {/* Corner brackets */}
              {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
                <div
                  key={pos}
                  className={`absolute ${pos} w-5 h-5 border-cyber-400/60
                    ${pos.includes('top') && pos.includes('left')    ? 'border-t-2 border-l-2' : ''}
                    ${pos.includes('top') && pos.includes('right')   ? 'border-t-2 border-r-2' : ''}
                    ${pos.includes('bottom') && pos.includes('left')  ? 'border-b-2 border-l-2' : ''}
                    ${pos.includes('bottom') && pos.includes('right') ? 'border-b-2 border-r-2' : ''}
                  `}
                />
              ))}
            </div>

            {/* File info bar */}
            {fileInfo && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                              bg-white/5 border border-white/10 text-sm">
                <FileImage className="w-4 h-4 text-cyber-400 shrink-0" />
                <span className="text-dark-800 font-medium truncate flex-1">{fileInfo.name}</span>
                <span className="badge-cyan shrink-0">{fileInfo.type}</span>
                <span className="text-dark-700 shrink-0 font-mono text-xs">{fileInfo.size}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;

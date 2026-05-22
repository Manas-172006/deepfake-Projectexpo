/**
 * Shared utility helpers
 */

/**
 * Format bytes to a human-readable string.
 * @param {number} bytes
 * @param {number} decimals
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Delay execution for ms milliseconds.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Truncate a filename to maxLength characters.
 */
export const truncateFilename = (name, maxLength = 30) => {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, maxLength - ext.length - 4);
  return `${base}…${ext}`;
};

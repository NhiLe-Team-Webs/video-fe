/**
 * File Handle Manager
 * 
 * This utility helps prevent EMFILE errors by managing file handles
 * and ensuring proper cleanup of resources.
 */

import { warn } from './logger';

// Track active file handles
const activeHandles = new Set<string>();
const MAX_CONCURRENT_HANDLES = 50; // Conservative limit for Windows

// Cleanup interval in milliseconds
const CLEANUP_INTERVAL = 30000; // 30 seconds

// Last cleanup timestamp
let lastCleanup = Date.now();

/**
 * Register a file handle to track it
 */
export const registerFileHandle = (path: string): void => {
  activeHandles.add(path);
  
  // Periodic cleanup
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    cleanupStaleHandles();
    lastCleanup = Date.now();
  }
  
  // Warning if approaching limit
  if (activeHandles.size > MAX_CONCURRENT_HANDLES * 0.8) {
    warn(`File handle count approaching limit: ${activeHandles.size}/${MAX_CONCURRENT_HANDLES}`);
  }
};

/**
 * Unregister a file handle
 */
export const unregisterFileHandle = (path: string): void => {
  activeHandles.delete(path);
};

/**
 * Get current handle count
 */
export const getHandleCount = (): number => activeHandles.size;

/**
 * Clean up stale handles (older than 5 minutes)
 */
const cleanupStaleHandles = (): void => {
  // This is a placeholder for more sophisticated cleanup logic
  // In a real implementation, you might track timestamps and age
  if (activeHandles.size > MAX_CONCURRENT_HANDLES) {
    warn(`Too many active file handles: ${activeHandles.size}. Consider reducing concurrency.`);
  }
};

/**
 * Check if we can safely open more files
 */
export const canOpenMoreFiles = (): boolean => {
  return activeHandles.size < MAX_CONCURRENT_HANDLES;
};

/**
 * Wait for available file handle slots
 */
export const waitForAvailableSlot = async (): Promise<void> => {
  if (canOpenMoreFiles()) {
    return;
  }
  
  warn(`Waiting for available file handle slot. Current: ${activeHandles.size}`);
  
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (canOpenMoreFiles()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
};
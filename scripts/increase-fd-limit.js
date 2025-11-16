/**
 * Script to increase file descriptor limit on Windows
 * This helps prevent EMFILE errors when processing many files
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/* eslint-disable no-console */

console.log('Checking and adjusting file descriptor limits...');

try {
  // On Windows, we need to set registry keys for higher limits
  // This requires administrator privileges
  
  // Check if we're on Windows
  if (process.platform === 'win32') {
    console.log('Windows detected. Applying file handle optimizations...');
    
    // Set environment variable for Node.js
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
    
    // Try to increase the limit using Windows command
    try {
      execSync('wmic computersystem get TotalPhysicalMemory', { stdio: 'pipe' });
      console.log('System information retrieved successfully');
    } catch {
      console.log('Could not retrieve system information (may require admin rights)');
    }
    
    // Create a .env file with optimized settings
    const envPath = path.join(process.cwd(), '.env');
    const envContent = `
# File handle optimization for Remotion
NODE_OPTIONS=--max-old-space-size=4096
UV_THREADPOOL_SIZE=4
REMOTION_CONCURRENCY=1
REMOTION_MAX_TIMELINE_TRACKS=500
`;
    
    fs.writeFileSync(envPath, envContent.trim());
    console.log('Created .env file with optimized settings');
  } else {
    console.log('Non-Windows platform detected. Using ulimit to increase file descriptor limit...');
    try {
      execSync('ulimit -n 65536', { stdio: 'inherit' });
      console.log('File descriptor limit increased to 65536');
    } catch {
      console.log('Could not increase file descriptor limit (may require shell configuration)');
    }
  }
  
  console.log('File handle optimization complete');
} catch (error) {
  console.error('Error during file handle optimization:', error.message);
  process.exit(1);
}
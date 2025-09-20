#!/usr/bin/env node

// Simple script to start the development server with proper environment variables
const { spawn } = require('child_process');
const os = require('os');

// Set environment variables
process.env.DEBUG = 'expo*';

// Command to run
const command = 'bunx';
const args = ['rork', 'start', '-p', '87juor6a61cmt59y3pxiy', '--web', '--tunnel'];

console.log('🚀 Starting Expo development server with debug...');
console.log(`📱 Platform: ${os.platform()}`);
console.log(`🔧 DEBUG: ${process.env.DEBUG}`);

// Spawn the process
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('error', (error) => {
  console.error('❌ Error starting development server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n🛑 Development server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGTERM');
});

// Mock WASM module for development
// This file provides a mock implementation for WASM modules that can't be resolved in development

export default {
  // Mock WASM module properties
  memory: new WebAssembly.Memory({ initial: 256 }),
  exports: {},
  instance: null,
  
  // Mock methods that might be called
  init: () => Promise.resolve(),
  ready: () => Promise.resolve(),
  
  // Mock for expo-sqlite specific usage
  create: () => ({
    exec: () => Promise.resolve(),
    close: () => Promise.resolve(),
  }),
};

// For CommonJS compatibility
module.exports = {
  default: {
    memory: new WebAssembly.Memory({ initial: 256 }),
    exports: {},
    instance: null,
    init: () => Promise.resolve(),
    ready: () => Promise.resolve(),
    create: () => ({
      exec: () => Promise.resolve(),
      close: () => Promise.resolve(),
    }),
  }
};

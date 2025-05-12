export const environment = {
  isBrowser: typeof window !== 'undefined' && typeof window.document !== 'undefined',
  isNode:
    typeof process !== 'undefined' && process.versions != null && process.versions.node != null,
  isWebWorker:
    typeof self === 'object' &&
    self.constructor &&
    self.constructor.name === 'DedicatedWorkerGlobalScope',
  isServiceWorker:
    typeof self === 'object' &&
    self.constructor &&
    self.constructor.name === 'ServiceWorkerGlobalScope',
  isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',

  // Helper methods
  hasNativeWebSocket(): boolean {
    if (this.isReactNative) return true;

    if (this.isBrowser || this.isWebWorker) {
      return 'WebSocket' in (this.isBrowser ? window : self);
    }

    if (this.isNode) {
      // Node.js v22+ has native WebSocket support
      const nodeVersion = process.versions.node;
      const major = parseInt(nodeVersion.split('.')[0], 10);
      return major >= 22;
    }

    return false;
  },

  supportsWebSocket(): boolean {
    // React Native has its own WebSocket implementation
    if (this.isReactNative) return true;

    // First check for native support
    if (this.hasNativeWebSocket()) {
      return true;
    }

    // For Node.js without native support, try to load ws package
    if (this.isNode) {
      try {
        // Dynamic require to avoid bundling ws package in browser builds
        const WebSocket = (globalThis as any).require?.('ws');
        return typeof WebSocket === 'function';
      } catch {
        return false;
      }
    }

    return false;
  },

  supportsLocalStorage(): boolean {
    try {
      return this.isBrowser && 'localStorage' in window && window.localStorage !== null;
    } catch {
      return false;
    }
  },

  supportsCrypto(): boolean {
    return (
      (this.isBrowser && 'crypto' in window) ||
      (this.isWebWorker && 'crypto' in self) ||
      (this.isNode && 'crypto' in globalThis) ||
      this.isReactNative
    );
  },

  // Helper to get the appropriate global object
  getGlobalObject(): any {
    if (this.isBrowser) return window;
    if (this.isWebWorker || this.isServiceWorker) return self;
    if (this.isNode) return global;
    if (this.isReactNative) return global;
    return globalThis;
  },
};

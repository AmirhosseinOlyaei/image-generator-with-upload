// Type definitions for global DOM types
// This file ensures HTMLElement and Element types are properly recognized throughout the app

// Only declare these if they're not already defined
interface Element {
  // Type exists in lib.dom.d.ts - adding it here ensures it's recognized
}

interface HTMLElement extends Element {
  // Type exists in lib.dom.d.ts - adding it here ensures it's recognized
}

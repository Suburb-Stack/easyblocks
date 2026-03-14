"use client";

import { css as gooberCss, setup as gooberSetup } from "goober";
import React, { createContext, ReactNode, useContext } from "react";
import { CompilationMetadata } from "../types";

// Initialize goober with React's createElement
let _gooberInitialized = false;
function ensureGooberSetup() {
  if (!_gooberInitialized) {
    gooberSetup(React.createElement);
    _gooberInitialized = true;
  }
}

/**
 * A stitches-compatible wrapper around goober's css() function.
 *
 * Stitches API: `stitches.css({ ...styles })()` → { className, toString() }
 * goober API:   `css({ ...styles })` → className string
 *
 * This wrapper bridges the gap so existing component code doesn't need
 * to change its call pattern immediately. It supports both:
 *   - `stitches.css({...})()` used as a string (Box.tsx, Placeholder.tsx)
 *   - `stitches.css({...})().className` (BlockControls.tsx, richText.editor.tsx)
 */
function createStitchesCompatLayer() {
  return {
    css: (styles: Record<string, any>) => {
      // Return a function that, when called, produces a stitches-compatible result
      return () => {
        const className = gooberCss(styles);
        // Return an object that:
        // 1. Has `.className` property (used by BlockControls.tsx, richText.editor.tsx)
        // 2. Converts to string via toString/valueOf (used by Box.tsx, Placeholder.tsx, etc)
        // 3. Works in string concatenation and template literals
        return {
          className,
          toString: () => className,
          valueOf: () => className,
          // Allow array filtering and joining (e.g. [boxClassName, ...].filter(Boolean).join(" "))
          [Symbol.toPrimitive]: () => className,
        };
      };
    },
  };
}

const EasyblocksMetadataContext = createContext<
  (CompilationMetadata & { stitches: any }) | undefined
>(undefined);

type EasyblocksMetadataProviderProps = {
  children: ReactNode;
  meta: CompilationMetadata;
};

const stitchesCompat = createStitchesCompatLayer();

const EasyblocksMetadataProvider: React.FC<EasyblocksMetadataProviderProps> = ({
  meta,
  children,
}) => {
  ensureGooberSetup();

  return (
    <EasyblocksMetadataContext.Provider
      value={{
        ...meta,
        stitches: stitchesCompat,
      }}
    >
      {children}
    </EasyblocksMetadataContext.Provider>
  );
};

function useEasyblocksMetadata() {
  const context = useContext(EasyblocksMetadataContext);

  if (!context) {
    throw new Error(
      "useEasyblocksMetadata must be used within a EasyblocksMetadataProvider",
    );
  }

  return context;
}

export { EasyblocksMetadataProvider, useEasyblocksMetadata };

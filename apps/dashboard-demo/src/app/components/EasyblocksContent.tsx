"use client";

import {
  Easyblocks,
  easyblocksGetStyleTagAndFlush,
  easyblocksResetSsrState,
} from "@suburb-stack/core";
import { useServerInsertedHTML } from "next/navigation";
import { ComponentPropsWithoutRef, ReactNode, useRef } from "react";

/**
 * Renders once per page to collect goober CSS and inject it via
 * `useServerInsertedHTML`. Wrap your page layout (which may contain
 * multiple `EasyblocksContent` instances) with this provider so that
 * the hook is only registered once.
 */
function EasyblocksStyleProvider({ children }: { children: ReactNode }) {
  const didReset = useRef(false);
  if (!didReset.current) {
    didReset.current = true;
    easyblocksResetSsrState();
  }

  useServerInsertedHTML(() => {
    return easyblocksGetStyleTagAndFlush();
  });

  return <>{children}</>;
}

/**
 * Pure rendering wrapper — does NOT register `useServerInsertedHTML`.
 * Use `EasyblocksStyleProvider` once higher in the tree to handle SSR styles.
 */
function EasyblocksContent(props: ComponentPropsWithoutRef<typeof Easyblocks>) {
  return <Easyblocks {...props} />;
}

export { EasyblocksContent, EasyblocksStyleProvider };

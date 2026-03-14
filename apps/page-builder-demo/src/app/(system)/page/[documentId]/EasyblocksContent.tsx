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
 * `useServerInsertedHTML`. Wrap your page content with this provider.
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

function EasyblocksContent({
  renderableDocument,
  externalData,
  components,
}: ComponentPropsWithoutRef<typeof Easyblocks>) {
  return (
    <Easyblocks
      renderableDocument={renderableDocument}
      externalData={externalData}
      components={components}
    />
  );
}

export { EasyblocksContent, EasyblocksStyleProvider };

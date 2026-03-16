"use client";

import React, { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { extractCss } from "goober";

// goober setup() is auto-initialized by @suburb-stack/design-system on import.
// Do NOT call setup() again here — it would overwrite the shouldForwardProp
// configuration established by design-system.

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const didReset = useRef(false);
  if (!didReset.current) {
    didReset.current = true;
    // Drain any leftover CSS from a previous request so it doesn't leak.
    extractCss();
  }

  useServerInsertedHTML(() => {
    const css = extractCss();
    if (!css) return null;
    // Use goober's own style-tag id so the client reuses the SSR element
    // and its built-in dedup prevents re-injecting the same rules.
    return <style id="_goober" dangerouslySetInnerHTML={{ __html: css }} />;
  });

  return <>{children}</>;
}

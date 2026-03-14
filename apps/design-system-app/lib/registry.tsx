"use client";

import React from "react";
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
  useServerInsertedHTML(() => {
    const css = extractCss();
    if (!css) return null;
    return <style id="goober" dangerouslySetInnerHTML={{ __html: css }} />;
  });

  return <>{children}</>;
}

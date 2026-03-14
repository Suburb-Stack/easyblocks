"use client";

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { extractCss, setup } from "goober";

// Ensure goober is initialized
setup(React.createElement);

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

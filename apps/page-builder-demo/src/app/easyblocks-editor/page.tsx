"use client";

import nextDynamic from "next/dynamic";

// Dynamically import entire editor content with SSR disabled to avoid styled-components SSR issues
const EasyblocksEditorContent = nextDynamic(
  () => import("./EasyblocksEditorContent"),
  { ssr: false },
);

export default function EeasyblocksEditorPage() {
  return <EasyblocksEditorContent />;
}

// Disable static generation for this page due to styled-components SSR incompatibility
export const dynamic = "force-dynamic";

"use client";
import { Easyblocks, easyblocksGetStyleTagAndFlush } from "@suburb-stack/core";
import { useServerInsertedHTML } from "next/navigation";
import { ComponentPropsWithoutRef } from "react";

function EasyblocksContent({
  renderableDocument,
  externalData,
  components,
}: ComponentPropsWithoutRef<typeof Easyblocks>) {
  useServerInsertedHTML(() => {
    return easyblocksGetStyleTagAndFlush();
  });

  return (
    <Easyblocks
      renderableDocument={renderableDocument}
      externalData={externalData}
      components={components}
    />
  );
}

export { EasyblocksContent };

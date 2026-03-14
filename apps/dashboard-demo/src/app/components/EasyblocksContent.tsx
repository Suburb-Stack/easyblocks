"use client";

import { Easyblocks, easyblocksGetStyleTagAndFlush } from "@suburb-stack/core";
import { useServerInsertedHTML } from "next/navigation";
import { ComponentPropsWithoutRef } from "react";

function EasyblocksContent(props: ComponentPropsWithoutRef<typeof Easyblocks>) {
  useServerInsertedHTML(() => {
    return easyblocksGetStyleTagAndFlush();
  });

  return <Easyblocks {...props} />;
}

export { EasyblocksContent };

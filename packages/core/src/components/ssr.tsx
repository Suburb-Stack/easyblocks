import React from "react";
import { extractCss } from "goober";

/**
 * @deprecated Stitches compatibility shim — will be removed.
 */
export const easyblocksStitchesInstances: any[] = [];

/**
 * Returns accumulated CSS text from goober's style sheet.
 */
export function easyblocksGetCssText() {
  // goober's extractCss() with no args reads from the virtual target
  return extractCss();
}

/**
 * Returns accumulated CSS text and flushes the buffer so that subsequent
 * calls only return newly-added styles. This prevents the same CSS block
 * from being emitted multiple times during SSR streaming.
 *
 * goober's `extractCss()` automatically resets the buffer.
 */
export function easyblocksGetCssTextAndFlush() {
  return extractCss();
}

/**
 * @deprecated Use `easyblocksGetStyleTagAndFlush` instead for proper deduplication.
 * Returns a `<style>` tag with the accumulated CSS. Does NOT flush — calling
 * this from multiple components will produce duplicate blocks.
 */
export function easyblocksGetStyleTag() {
  return (
    <style
      id="easyblocks-css"
      dangerouslySetInnerHTML={{ __html: easyblocksGetCssText() }}
    />
  );
}

let _flushCounter = 0;

/**
 * Returns a `<style>` tag with the accumulated CSS and flushes the buffer.
 * Safe to call from `useServerInsertedHTML` — subsequent calls within the
 * same render cycle return only the delta (newly added styles).
 *
 * Returns `null` when there is no new CSS to inject.
 */
export function easyblocksGetStyleTagAndFlush() {
  const css = easyblocksGetCssTextAndFlush();

  if (!css) {
    return null;
  }

  // Use a unique id per flush so React doesn't deduplicate the elements
  const id = `easyblocks-css${_flushCounter > 0 ? `-${_flushCounter}` : ""}`;
  _flushCounter++;

  return <style id={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

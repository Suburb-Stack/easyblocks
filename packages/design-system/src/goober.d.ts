/**
 * Augment JSX to allow the `css` prop on all elements.
 *
 * Goober's `setup(React.createElement)` processes the `css` prop at runtime,
 * but its type definitions do not declare it. This module augmentation makes
 * TypeScript aware of the prop so that `<div css={`...`}>` and
 * `<RadixComponent css={`...`}>` are valid.
 */

import "react";

declare module "react" {
  // Cover native HTML elements (<div css={...}>, <span css={...}>, etc.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    css?: string;
  }

  // Cover SVG elements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SVGAttributes<T> {
    css?: string;
  }

  // Cover all React components (Radix UI, custom components, etc.)
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicAttributes {
      css?: string;
    }
  }
}

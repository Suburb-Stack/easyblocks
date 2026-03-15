/**
 * Styled-components compatibility layer built on top of goober.
 *
 * This module provides a drop-in replacement for `styled-components` imports:
 *
 *   Before: import styled, { css, keyframes, createGlobalStyle } from "styled-components";
 *   After:  import styled, { css, keyframes, createGlobalStyle } from "./styled";
 *
 * It supports:
 *   - `styled.div`, `styled.span`, etc. via Proxy
 *   - `styled.div.withConfig(...)` for shouldForwardProp
 *   - Template literal and object syntax
 *   - `css` helper for shared styles
 *   - `keyframes` for animations
 *   - `createGlobalStyle` via goober's `glob`
 *   - Automatic stripping of $-prefixed transient props (like styled-components)
 *   - Global prop-validity filtering via @emotion/is-prop-valid
 */

import {
  styled as gooberStyled,
  css as gooberCss,
  keyframes as gooberKeyframes,
  setup,
} from "goober";
import { shouldForwardProp as gooberShouldForwardProp } from "goober/should-forward-prop";
import isPropValid from "@emotion/is-prop-valid";
import React from "react";

/**
 * Monkey-patch React.createElement to:
 *   1. Convert the `css` prop to a className (goober css-prop support).
 *   2. Strip `$`-prefixed transient props from native HTML elements.
 *
 * (2) acts as a safety net: even if goober's global shouldForwardProp is not
 * active (race-condition, tree-shaking, or a later setup() call that clears it),
 * transient props will never leak to the DOM.
 */
function installCssPropSupport() {
  if ((globalThis as any).__GOOBER_CSS_PROP__) return;
  (globalThis as any).__GOOBER_CSS_PROP__ = true;

  const _origCE = React.createElement;
  (React as any).createElement = function gooberCssPropInterceptor(
    type: any,
    props: any,
  ) {
    // --- css prop handling ---
    if (props != null && typeof props.css === "string" && props.css) {
      const newProps = Object.assign({}, props);
      const cssStr: string = newProps.css;
      delete newProps.css;
      const cls = gooberCss(Object.assign([cssStr], { raw: [cssStr] }) as any);
      newProps.className = newProps.className
        ? cls + " " + newProps.className
        : cls;
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = Array.prototype.slice.call(arguments);
      args[1] = newProps;
      return _origCE.apply(null, args as any);
    }

    // --- Strip $-prefixed transient props from native HTML elements ---
    if (typeof type === "string" && props != null) {
      const keys = Object.keys(props);
      const hasDollarProps = keys.some((k) => k.charCodeAt(0) === 36 /* $ */);
      if (hasDollarProps) {
        const cleaned: Record<string, any> = {};
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].charCodeAt(0) !== 36) {
            cleaned[keys[i]] = props[keys[i]];
          }
        }
        // eslint-disable-next-line prefer-rest-params
        const args: any[] = Array.prototype.slice.call(arguments);
        args[1] = cleaned;
        return _origCE.apply(null, args as any);
      }
    }

    // eslint-disable-next-line prefer-rest-params
    return _origCE.apply(null, arguments as any);
  };
}

/**
 * Creates a styled-components-compatible `.attrs()` wrapper.
 */
function createAttrs(tag: string | React.ComponentType, attrsArg: any) {
  const styledFn = gooberStyled(tag as any);

  return function attrsTagged(strOrObj: any, ...values: any[]) {
    const StyledComponent = styledFn(strOrObj, ...values);

    const AttrsComponent = React.forwardRef((props: any, ref: any) => {
      const extraProps =
        typeof attrsArg === "function" ? attrsArg(props) : attrsArg;
      return React.createElement(StyledComponent, {
        ...props,
        ...extraProps,
        ref,
      });
    });

    AttrsComponent.displayName = `Attrs(${
      typeof tag === "string" ? tag : tag.displayName || tag.name || "Component"
    })`;

    return AttrsComponent;
  };
}

// Ensure goober is initialized with React's createElement + prop filtering.
// Check both a local flag and the global __GOOBER_SETUP__ sentinel so that
// if another package (editor, core) already called setup(), we don't
// overwrite goober's internal configuration (e.g. shouldForwardProp).
let _initialized = false;
export function ensureGooberSetup() {
  if (_initialized || (globalThis as any).__GOOBER_SETUP__) return;
  _initialized = true;
  installCssPropSupport();
  // Use goober's shouldForwardProp with @emotion/is-prop-valid to globally
  // filter out non-HTML props from reaching the DOM. This also strips
  // $-prefixed transient props (same as styled-components).
  setup(
    React.createElement,
    undefined,
    undefined,
    gooberShouldForwardProp((prop) => {
      // Strip $-prefixed transient props (styled-components convention)
      if (prop.startsWith("$")) return false;
      return isPropValid(prop);
    }),
  );
  (globalThis as any).__GOOBER_SETUP__ = true;
}

// Auto-initialize on import
ensureGooberSetup();

/**
 * Recursively resolve a value that may be a function (or a function returning
 * a function, e.g. from css`` with function interpolations).
 */
function resolveValue(val: any, props: any): any {
  let resolved = val;
  // Allow up to 3 levels of nested function resolution
  for (let i = 0; i < 3 && typeof resolved === "function"; i++) {
    resolved = resolved(props);
  }
  return resolved;
}

/**
 * `css` helper — works like styled-components' css`` tag.
 *
 * styled-components' css returns an intermediate representation (array of
 * strings and functions) that is resolved later when embedded in a styled
 * template.  goober's css() generates a class name eagerly, which breaks
 * when function interpolations expect component props.
 *
 * This implementation:
 *   - With function interpolations: returns a *function* (props) => cssString
 *     so that goober's styled() can call it with component props at render time.
 *   - Without function interpolations: returns the raw CSS string for inline
 *     embedding inside styled / createGlobalStyle templates.
 *   - Object syntax: delegates to gooberCss to generate a className.
 */
export function css<P = unknown>(
  tag: TemplateStringsArray | Record<string, any>,
  ...values: any[]
): any {
  if (Array.isArray(tag) || "raw" in (tag as any)) {
    const strings = tag as TemplateStringsArray;
    const hasFns = values.some((v) => typeof v === "function");

    if (hasFns) {
      // Return a function so goober's styled() calls it with props.
      // Mark it so we can identify css-returned functions for recursive resolution.
      const cssFn = (props: any) => {
        return strings.reduce((acc, str, i) => {
          if (i >= values.length) return acc + str;
          const val = resolveValue(values[i], props);
          return acc + str + (val != null && val !== false ? val : "");
        }, "");
      };
      return cssFn;
    }

    // Static template — return raw CSS string (not a class name)
    return strings.reduce((acc, str, i) => {
      if (i >= values.length) return acc + str;
      const val = values[i];
      return acc + str + (val != null && val !== false ? val : "");
    }, "");
  }

  // Object usage: css({ color: 'red' }) → class name
  return gooberCss(tag as any);
}

/**
 * `keyframes` — same API as styled-components
 */
export function keyframes(
  tag: TemplateStringsArray | Record<string, any>,
  ...values: any[]
): string {
  if (Array.isArray(tag) || "raw" in (tag as any)) {
    return gooberKeyframes(tag as TemplateStringsArray, ...values);
  }
  return gooberKeyframes(tag as any);
}

/**
 * `createGlobalStyle` — injects global CSS.
 *
 * styled-components returns a component that injects/removes global styles
 * synchronously (before paint). We use useInsertionEffect for the same timing.
 *
 * IMPORTANT: We do NOT use goober's `glob()` here because goober's glob is
 * designed for a single global style block — each call REPLACES the previous
 * one's CSS. When multiple createGlobalStyle components mount (e.g.
 * GlobalStyles + GlobalModalStyles), only the last one's CSS would survive.
 * Instead, we create a dedicated <style> tag per createGlobalStyle instance.
 */
export function createGlobalStyle(
  tag: TemplateStringsArray,
  ...values: any[]
): React.FC {
  // Pre-process the template into a static CSS string (global styles don't receive props)
  const cssText = tag.reduce((acc, str, i) => {
    if (i >= values.length) return acc + str;
    const val = typeof values[i] === "function" ? values[i]({}) : values[i];
    return acc + str + (val != null ? val : "");
  }, "");

  // Generate a stable fingerprint so we can detect duplicates.
  // Simple djb2 hash — sufficient for dedup purposes.
  let hash = 5381;
  for (let i = 0; i < cssText.length; i++) {
    hash = ((hash << 5) + hash + cssText.charCodeAt(i)) | 0;
  }
  const fingerprintAttr = `data-gs-${(hash >>> 0).toString(36)}`;

  return function GlobalStyle() {
    // useInsertionEffect fires synchronously before DOM mutations are painted,
    // matching styled-components' synchronous injection behavior and preventing FOUC.
    React.useInsertionEffect(() => {
      // Skip if an identical global style tag already exists (e.g. from SSR
      // hydration or React strict-mode double-mount).
      if (document.head.querySelector(`style[${fingerprintAttr}]`)) {
        return;
      }

      const style = document.createElement("style");
      style.setAttribute("data-goober-global", "");
      style.setAttribute(fingerprintAttr, "");
      style.textContent = cssText;
      document.head.appendChild(style);

      // Cleanup: remove the style tag on unmount so global styles don't leak
      // when the component is conditionally rendered.
      return () => {
        document.head.removeChild(style);
      };
    }, []);
    return null;
  };
}

type WithConfigOptions = {
  shouldForwardProp?: (prop: string) => boolean;
};

// ---------------------------------------------------------------------------
// Type definitions for the styled proxy
// ---------------------------------------------------------------------------

/** Values allowed inside a styled tagged template literal */
type TaggedValue<P> =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, any>
  | ((props: P) => string | number | false | null | undefined);

/** Props added by goober's styled() to every component */
export interface StyledExtraProps {
  as?: React.ElementType;
}

/** The tagged-template function returned by e.g. `styled.div` */
interface StyledTagFn<BaseProps> {
  <CustomProps = {}>(
    strings: TemplateStringsArray,
    ...values: TaggedValue<BaseProps & CustomProps>[]
  ): React.FC<BaseProps & CustomProps & StyledExtraProps>;
  (
    strings: TemplateStringsArray,
    ...values: TaggedValue<BaseProps>[]
  ): React.FC<BaseProps & StyledExtraProps>;
  withConfig(opts: WithConfigOptions): StyledTagFn<BaseProps>;
}

/** The top-level `styled` interface */
interface StyledInterface {
  <T extends React.ComponentType<any>>(
    component: T,
  ): StyledTagFn<React.ComponentPropsWithRef<T>>;
  <Tag extends keyof React.JSX.IntrinsicElements>(
    tag: Tag,
  ): StyledTagFn<React.JSX.IntrinsicElements[Tag]>;
}

// Map every HTML/SVG tag to a StyledTagFn with the correct base props
type StyledTags = {
  [Tag in keyof React.JSX.IntrinsicElements]: StyledTagFn<
    React.JSX.IntrinsicElements[Tag]
  >;
};

type StyledFull = StyledInterface & StyledTags;

/**
 * Wraps goober's styled() template function to add recursive function resolution.
 *
 * goober only resolves one level of function interpolation. When css() returns a
 * function (for deferred prop resolution) and that function is returned from another
 * function interpolation (e.g. `${(p) => !p.isRaw && getControlPadding()}`), goober
 * resolves the outer function but not the inner. We wrap each function interpolation
 * to recursively resolve nested functions with the same props.
 */
function wrapInterpolations(values: any[]): any[] {
  return values.map((val) => {
    if (typeof val !== "function") return val;
    return (props: any) => resolveValue(val, props);
  });
}

/**
 * Creates a tagged template function that wraps goober's styled() with
 * optional shouldForwardProp filtering.
 *
 * IMPORTANT: In styled-components, shouldForwardProp only filters what reaches
 * the final DOM element — template interpolation functions still receive ALL props.
 * For string tags (HTML elements), we use goober's `as` prop to redirect rendering
 * through a FilteredTag component that strips blocked props at the DOM boundary,
 * while CSS interpolation still sees all props.  For component tags, we filter
 * before passing to goober (original behaviour).
 */
function createTaggedStyled(
  tag: string | React.ComponentType,
  withConfigOpts?: WithConfigOptions,
) {
  // Defensive: ensure goober is configured even if the module-level
  // ensureGooberSetup() was tree-shaken by the consumer's bundler
  // (packages declare "sideEffects": false).  The guard inside
  // ensureGooberSetup makes this a no-op after the first call.
  ensureGooberSetup();

  const styledFn = gooberStyled(tag as any);

  if (!withConfigOpts?.shouldForwardProp) {
    // No custom shouldForwardProp — wrap interpolations for recursive resolution
    return function plainTagged(strOrObj: any, ...values: any[]) {
      return styledFn(strOrObj, ...wrapInterpolations(values));
    };
  }

  // With shouldForwardProp: we need CSS interpolation functions to see ALL
  // props (matching styled-components), while preventing non-forwarded props
  // from reaching the DOM element.
  //
  // For string tags (HTML elements), we use goober's `as` prop to redirect
  // rendering through a FilteredTag component that strips blocked props at
  // the DOM boundary. CSS interpolation still sees everything because goober
  // computes styles from the props BEFORE delegating to `as`.
  //
  // For component tags, we filter props before passing to goober (CSS
  // interpolation won't see filtered props — same as the pre-existing
  // behavior before the styled-components migration).
  const componentShouldForwardProp = withConfigOpts.shouldForwardProp;

  return function wrappedTagged(strOrObj: any, ...values: any[]) {
    // Create the goober styled component with wrapped interpolations
    const GooberComponent = styledFn(strOrObj, ...wrapInterpolations(values));

    // For string tags, create a DOM-boundary filter that applies BOTH the
    // per-component shouldForwardProp AND isPropValid.  This component is
    // created once per styled() call, not per render.
    let FilteredTag: React.ForwardRefExoticComponent<any> | null = null;
    if (typeof tag === "string") {
      FilteredTag = React.forwardRef((innerProps: any, innerRef: any) => {
        const clean: Record<string, any> = {};
        for (const key of Object.keys(innerProps)) {
          if (key === "children" || key === "ref") {
            clean[key] = innerProps[key];
          } else if (isPropValid(key) && componentShouldForwardProp(key)) {
            clean[key] = innerProps[key];
          }
          // Props that fail either filter are silently dropped
        }
        return React.createElement(tag, { ...clean, ref: innerRef });
      });
      FilteredTag.displayName = `FilteredTag(${tag})`;
    }

    const FilteredComponent = React.forwardRef((props: any, ref: any) => {
      if (FilteredTag) {
        // String tag: pass all props to goober for CSS interpolation, but
        // render through FilteredTag which strips non-forward props at the
        // DOM boundary.  goober uses the `as` prop to delegate rendering.
        return React.createElement(GooberComponent, {
          ...props,
          ref,
          as: FilteredTag,
        });
      }
      // Component tag: filter props before passing to goober.
      const filteredProps: Record<string, any> = {};
      for (const key of Object.keys(props)) {
        if (
          key === "children" ||
          key === "ref" ||
          key === "as" ||
          componentShouldForwardProp(key)
        ) {
          filteredProps[key] = props[key];
        }
      }
      return React.createElement(GooberComponent, { ...filteredProps, ref });
    });

    FilteredComponent.displayName = `Filtered(${
      typeof tag === "string" ? tag : tag.displayName || tag.name || "Component"
    })`;

    return FilteredComponent;
  };
}

/**
 * Proxy-based `styled` that supports:
 *   styled.div`...`
 *   styled.div<Props>`...`
 *   styled.div.withConfig({ shouldForwardProp })<Props>`...`
 *   styled(Component)`...`
 */
const styledProxy = new Proxy(gooberStyled, {
  get(_target, prop: string) {
    // styled.div, styled.span, etc.
    return new Proxy(createTaggedStyled(prop), {
      get(_styledTag, innerProp: string) {
        if (innerProp === "withConfig") {
          return (opts: WithConfigOptions) => createTaggedStyled(prop, opts);
        }
        if (innerProp === "attrs") {
          return (attrsArg: any) => createAttrs(prop, attrsArg);
        }
        return Reflect.get(_styledTag, innerProp);
      },
    });
  },
  apply(_target, _thisArg, args) {
    // styled(Component) or styled('div')
    return createTaggedStyled(args[0]);
  },
}) as unknown as StyledFull;

export default styledProxy;
export { styledProxy as styled };

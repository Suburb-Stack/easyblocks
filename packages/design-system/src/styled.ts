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
 */

import {
  styled as gooberStyled,
  css as gooberCss,
  keyframes as gooberKeyframes,
  glob,
  setup,
} from "goober";
import React from "react";

/**
 * Monkey-patch React.createElement to convert the `css` prop to a className.
 *
 * goober does NOT wrap createElement — the `css` prop on arbitrary JSX elements
 * (e.g. `<div css="color:red">`) is silently passed through as an HTML attribute
 * unless we intercept it here and convert it to a goober-generated className.
 */
function installCssPropSupport() {
  if ((globalThis as any).__GOOBER_CSS_PROP__) return;
  (globalThis as any).__GOOBER_CSS_PROP__ = true;

  const _origCE = React.createElement;
  (React as any).createElement = function gooberCssPropInterceptor(
    type: any,
    props: any,
  ) {
    if (props != null && typeof props.css === "string" && props.css) {
      const newProps = Object.assign({}, props);
      const cssStr: string = newProps.css;
      delete newProps.css;
      // Build a tagged-template-like argument for goober's css()
      const cls = gooberCss(Object.assign([cssStr], { raw: [cssStr] }) as any);
      newProps.className = newProps.className
        ? cls + " " + newProps.className
        : cls;
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = Array.prototype.slice.call(arguments);
      args[1] = newProps;
      return _origCE.apply(null, args as any);
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

// Ensure goober is initialized with React's createElement
let _initialized = false;
export function ensureGooberSetup() {
  if (!_initialized) {
    _initialized = true;
    installCssPropSupport();
    setup(React.createElement);
    (globalThis as any).__GOOBER_SETUP__ = true;
  }
}

// Auto-initialize on import
ensureGooberSetup();

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
      // Return a function so goober's styled() calls it with props
      return (props: any) => {
        return strings.reduce((acc, str, i) => {
          if (i >= values.length) return acc + str;
          let val = values[i];
          if (typeof val === "function") val = val(props);
          // Recursively resolve if nested css() also returned a function
          if (typeof val === "function") val = val(props);
          return acc + str + (val != null && val !== false ? val : "");
        }, "");
      };
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
 * styled-components returns a component; we return a component that calls glob() on mount.
 */
export function createGlobalStyle(
  tag: TemplateStringsArray,
  ...values: any[]
): React.FC {
  return function GlobalStyle() {
    // Process template literal with interpolations
    const processedValues = values.map((v) =>
      typeof v === "function" ? v({}) : v,
    );
    glob(tag, ...processedValues);
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
 * Creates a tagged template function that wraps goober's styled() with
 * optional shouldForwardProp filtering.
 */
function createTaggedStyled(
  tag: string | React.ComponentType,
  withConfigOpts?: WithConfigOptions,
) {
  const styledFn = gooberStyled(tag as any);

  if (!withConfigOpts?.shouldForwardProp) {
    return styledFn;
  }

  // Wrap to filter props before passing to the underlying element
  const shouldForwardProp = withConfigOpts.shouldForwardProp;

  return function wrappedTagged(strOrObj: any, ...values: any[]) {
    const Component = styledFn(strOrObj, ...values);

    const FilteredComponent = React.forwardRef((props: any, ref: any) => {
      const filteredProps: Record<string, any> = {};
      for (const key of Object.keys(props)) {
        if (
          key === "children" ||
          key === "ref" ||
          key === "as" ||
          shouldForwardProp(key)
        ) {
          filteredProps[key] = props[key];
        }
      }
      return React.createElement(Component, { ...filteredProps, ref });
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

/**
 * Styled-components compatibility layer built on top of goober.
 * Mirror of packages/design-system/src/styled.ts.
 *
 * Both packages share the same goober runtime (singleton initialization via setup()).
 */

import {
  styled as gooberStyled,
  css as gooberCss,
  keyframes as gooberKeyframes,
  glob,
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

// Ensure goober is initialized with React's createElement + prop filtering
// Ensure goober is initialized with React's createElement + prop filtering.
// Check both a local flag and the global __GOOBER_SETUP__ sentinel so that
// if another package (design-system, core) already called setup(), we don't
// overwrite goober's internal configuration.
let _initialized = false;
export function ensureGooberSetup() {
  if (_initialized || (globalThis as any).__GOOBER_SETUP__) return;
  _initialized = true;
  installCssPropSupport();
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
 * With function interpolations: returns (props) => cssString so goober's
 * styled() can resolve them with component props at render time.
 * Without: returns raw CSS string for embedding in styled / glob templates.
 * Object syntax: delegates to gooberCss to generate a className.
 */
export function css<P = unknown>(
  tag: TemplateStringsArray | Record<string, any>,
  ...values: any[]
): any {
  if (Array.isArray(tag) || "raw" in (tag as any)) {
    const strings = tag as TemplateStringsArray;
    const hasFns = values.some((v) => typeof v === "function");

    if (hasFns) {
      const cssFn = (props: any) => {
        return strings.reduce((acc, str, i) => {
          if (i >= values.length) return acc + str;
          const val = resolveValue(values[i], props);
          return acc + str + (val != null && val !== false ? val : "");
        }, "");
      };
      return cssFn;
    }

    return strings.reduce((acc, str, i) => {
      if (i >= values.length) return acc + str;
      const val = values[i];
      return acc + str + (val != null && val !== false ? val : "");
    }, "");
  }

  return gooberCss(tag as any);
}

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
 * `createGlobalStyle` — injects global CSS synchronously before paint.
 */
export function createGlobalStyle(
  tag: TemplateStringsArray,
  ...values: any[]
): React.FC {
  const cssText = tag.reduce((acc, str, i) => {
    if (i >= values.length) return acc + str;
    const val = typeof values[i] === "function" ? values[i]({}) : values[i];
    return acc + str + (val != null ? val : "");
  }, "");

  return function GlobalStyle() {
    React.useInsertionEffect(() => {
      const fakeTag = Object.assign([cssText], {
        raw: [cssText],
      }) as unknown as TemplateStringsArray;
      glob(fakeTag);
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
  attrs<ExtraProps = {}>(
    attrsOrFn:
      | Partial<BaseProps & ExtraProps>
      | ((props: BaseProps & ExtraProps) => Partial<BaseProps & ExtraProps>),
  ): StyledTagFn<BaseProps & ExtraProps>;
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

/**
 * Wraps goober's styled() template function to add recursive function resolution.
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
 * In styled-components, shouldForwardProp only filters what reaches the final
 * DOM element — template interpolation functions still receive ALL props.
 * For string tags, we use goober's `as` prop to redirect rendering through a
 * FilteredTag component that strips blocked props at the DOM boundary, while
 * CSS interpolation still sees all props.  For component tags, we filter
 * before passing to goober (original behaviour).
 */
function createTaggedStyled(
  tag: string | React.ComponentType,
  withConfigOpts?: WithConfigOptions,
) {
  // Defensive: ensure goober is configured even if the module-level
  // ensureGooberSetup() was tree-shaken by the consumer's bundler
  // (packages declare "sideEffects": [...]).  The guard inside
  // ensureGooberSetup makes this a no-op after the first call.
  ensureGooberSetup();

  const styledFn = gooberStyled(tag as any);

  if (!withConfigOpts?.shouldForwardProp) {
    return function plainTagged(strOrObj: any, ...values: any[]) {
      return styledFn(strOrObj, ...wrapInterpolations(values));
    };
  }

  const componentShouldForwardProp = withConfigOpts.shouldForwardProp;

  return function wrappedTagged(strOrObj: any, ...values: any[]) {
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
        // render through FilteredTag which strips non-forward props.
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

const styledProxy = new Proxy(gooberStyled, {
  get(_target, prop: string) {
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
    return createTaggedStyled(args[0]);
  },
}) as unknown as StyledFull;

export default styledProxy;
export { styledProxy as styled };

/**
 * styled-components compatibility shims for SSR/prop-forwarding utilities.
 * goober handles prop forwarding via setup(), so these are no-ops/pass-throughs.
 */

// ShouldForwardProp type — used in EasyblocksParent.tsx for typing
export type ShouldForwardProp<T extends "web" | string = "web"> = (
  propName: string,
  target: any,
) => boolean;

// StyleSheetManager — goober doesn't need a wrapping provider; render children directly.
export function StyleSheetManager({
  children,
}: {
  children: React.ReactNode;
  shouldForwardProp?: ShouldForwardProp;
  enableVendorPrefixes?: boolean;
}) {
  return children as React.ReactElement;
}

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

// Ensure goober is initialized with React's createElement + prop filtering
let _initialized = false;
export function ensureGooberSetup() {
  if (!_initialized) {
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
 * We replicate this by passing ALL props to goober's styled component (so CSS
 * interpolations see them), then goober's global shouldForwardProp (set up via
 * setup()) filters them at the DOM boundary.
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

    const FilteredComponent = React.forwardRef((props: any, ref: any) => {
      // Pass all props to goober so CSS interpolation functions can access them.
      // goober's global setup() shouldForwardProp will handle DOM filtering.
      return React.createElement(GooberComponent, { ...props, ref });
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

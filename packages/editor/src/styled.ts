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

// Ensure goober is initialized with React's createElement + prop filtering
let _initialized = false;
export function ensureGooberSetup() {
  if (!_initialized) {
    setup(
      React.createElement,
      undefined,
      undefined,
      gooberShouldForwardProp((prop) => isPropValid(prop)),
    );
    _initialized = true;
  }
}

ensureGooberSetup();

/**
 * `css` helper — works like styled-components' css`` tag.
 *
 * With function interpolations: returns (props) => cssString so goober's
 * styled() can resolve them with component props at render time.
 * Without: returns raw CSS string for embedding in styled / glob templates.
 * Object syntax: delegates to gooberCss to generate a className.
 */
export function css(
  tag: TemplateStringsArray | Record<string, any>,
  ...values: any[]
): any {
  if (Array.isArray(tag) || "raw" in (tag as any)) {
    const strings = tag as TemplateStringsArray;
    const hasFns = values.some((v) => typeof v === "function");

    if (hasFns) {
      return (props: any) => {
        return strings.reduce((acc, str, i) => {
          if (i >= values.length) return acc + str;
          let val = values[i];
          if (typeof val === "function") val = val(props);
          if (typeof val === "function") val = val(props);
          return acc + str + (val != null && val !== false ? val : "");
        }, "");
      };
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

export function createGlobalStyle(
  tag: TemplateStringsArray,
  ...values: any[]
): React.FC {
  return function GlobalStyle() {
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

/**
 * Creates a styled-components-compatible `.attrs()` wrapper.
 *
 * `styled.div.attrs(attrsArg)` returns a template-tag function that creates a
 * component which merges the computed/static attrs into props before rendering.
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

function createTaggedStyled(
  tag: string | React.ComponentType,
  withConfigOpts?: WithConfigOptions,
) {
  const styledFn = gooberStyled(tag as any);

  if (!withConfigOpts?.shouldForwardProp) {
    return styledFn;
  }

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
}) as any;

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

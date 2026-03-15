const mainFont = "system-ui";
const fontVariationSettings = `'opsz' 21`;

/**
 * CSS property names that accept bare numbers without a `px` suffix.
 */
const unitlessProperties = new Set([
  "fontWeight",
  "lineHeight",
  "opacity",
  "zIndex",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "orphans",
  "widows",
  "animationIterationCount",
  "columnCount",
  "fillOpacity",
  "gridRow",
  "gridColumn",
]);

/**
 * Convert a camelCase CSS property name to kebab-case.
 * e.g. `fontFamily` → `font-family`, `fontVariationSettings` → `font-variation-settings`
 */
function toKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

/**
 * Convert a style object to a CSS string.
 * Numeric values automatically get `px` appended unless the property is unitless.
 *
 * styled-components did this transparently; goober does NOT for plain
 * object interpolations in template literals, so we need to do it ourselves.
 */
function cssString(obj: Record<string, string | number>): string {
  return Object.entries(obj)
    .map(([key, val]) => {
      const cssKey = toKebab(key);
      const cssVal =
        typeof val === "number" && !unitlessProperties.has(key)
          ? `${val}px`
          : val;
      return `${cssKey}: ${cssVal};`;
    })
    .join("\n  ");
}

type FontDef = Record<string, string | number> & { toString(): string };

/**
 * Create a font definition object that:
 * 1. Stringifies to valid CSS when interpolated in template literals (e.g. `${Fonts.body}`)
 * 2. Has numeric values pre-converted to strings with `px` so goober's parse()
 *    produces valid CSS when iterating object keys (e.g. `${(p) => Fonts.body}`)
 * 3. Has `toString` defined as non-enumerable to avoid goober's for-in iteration
 *    picking it up as a CSS declaration.
 */
function font(obj: Record<string, string | number>): FontDef {
  const css = cssString(obj);

  // Pre-convert numeric values to strings with px so goober's parse() works correctly
  const converted: Record<string, string | number> = {};
  for (const [key, val] of Object.entries(obj)) {
    converted[key] =
      typeof val === "number" && !unitlessProperties.has(key)
        ? `${val}px`
        : val;
  }

  // Non-enumerable toString so goober's for..in loop doesn't pick it up
  Object.defineProperty(converted, "toString", {
    value: () => css,
    enumerable: false,
    configurable: true,
  });

  return converted as FontDef;
}

const Fonts = {
  bodyLarge: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.2,
  }),
  body: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.15,
  }),
  body4: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.15,
  }),
  label: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.15,
  }),
  label2: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.15,
  }),
  label3: font({
    fontFamily: mainFont,
    fontVariationSettings,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.05em",
    lineHeight: 1.15,
  }),
};

export { Fonts };

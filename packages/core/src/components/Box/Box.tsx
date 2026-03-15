import React, { useMemo } from "react";
import { getBoxStyles } from "../../compiler/box";
import { Devices } from "../../types";

const boxStyles = {
  boxSizing: "border-box",
  minWidth: "0px",
  margin: 0,
  padding: 0,
  border: 0,
  listStyle: "none",
};

type BoxProps = {
  __compiled: any;
  __name?: string;
  devices: Devices;
  stitches: any;
  [key: string]: any;
};

const Box = React.forwardRef<HTMLElement, BoxProps>((props, ref) => {
  /**
   * passedProps - the props given in component code like <MyBox data-id="abc" /> (data-id is in passedProps)
   * restProps - the props given by Shopstory (like from actionWrapper)
   *
   * They are merged into "realProps".
   *
   * I know those names sucks, this needs to be cleaned up.
   */

  const { __compiled, __name, passedProps, devices, stitches, ...restProps } =
    props;

  const { __as, ...styles } = __compiled;
  const realProps = { ...restProps, ...passedProps };

  const { as, itemWrappers, className, ...restPassedProps } = realProps;

  const { boxClassName, componentClassName } = useMemo(() => {
    /**
     * Why parse+stringify?
     *
     * This ensures style objects from different execution contexts (e.g. iframe
     * vs parent window) are normalized into plain objects. Without this, nested
     * objects like media queries may be silently ignored by the CSS engine.
     */
    const correctedStyles = getBoxStyles(
      JSON.parse(JSON.stringify(styles)),
      devices,
    );

    const generateBoxClass = stitches.css(boxStyles);
    const generateClassName = stitches.css(correctedStyles);

    return {
      boxClassName: generateBoxClass(),
      componentClassName: generateClassName(),
    };
  }, [styles.__hash]);

  return React.createElement(
    as || __as || "div",
    {
      ref,
      ...restPassedProps,
      className: [boxClassName, componentClassName, className]
        .filter(Boolean)
        .join(" "),
      "data-testid": __name,
    },
    props.children,
  );
});

export { Box };

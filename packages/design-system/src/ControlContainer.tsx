import React, { ReactNode } from "react";
import styled, { css } from "./styled";
import { Colors } from "./colors";
import { Fonts } from "./fonts";
import { Icon } from "./icons";

export type ControlProps = {
  icon?: Icon;
  iconBlack?: boolean;
  controlSize?: any;
  iconOnly?: boolean;
  error?: boolean;
  withBorder?: boolean;
  hasError?: boolean;
  disabled?: boolean;
};

/** Transient-prop version used only by styled components */
type StyledControlProps = {
  $icon?: Icon;
  $iconBlack?: boolean;
  $controlSize?: any;
  $iconOnly?: boolean;
  $withBorder?: boolean;
  $hasError?: boolean;
  disabled?: boolean; // valid HTML attr — no prefix needed
};

function sizing(p: StyledControlProps) {
  const height = p.$controlSize === "tiny" ? 24 : 28;
  const paddingHorizontal = p.$controlSize === "tiny" ? 4 : 6;
  let paddingIcon = paddingHorizontal + (p.$icon ? 20 : 0);

  if (p.$iconOnly) {
    paddingIcon = 0;
  }

  return {
    height: height + "px",
    width:
      p.$controlSize === "full-width"
        ? "100%"
        : p.$iconOnly
          ? height + "px"
          : "auto",
    paddingHorizontal: paddingHorizontal + "px",
    paddingVertical: p.$controlSize === "tiny" ? "4px" : "6px",
    paddingIcon: paddingIcon + "px",
  };
}

const Root = styled.div<StyledControlProps>`
  position: relative;
  height: ${(p) => sizing(p).height};
  width: ${(p) => sizing(p).width};
  color: black;

  ${(p) => {
    const outlineStyles = `
      box-shadow: 0 0 0 1px ${p.$hasError ? "red" : Colors.black10};
      .ss-arrow {
        color: black;
      }
    `;

    if (p.$withBorder) {
      if (p.disabled) {
        return `
          ${outlineStyles}
          color: ${Colors.black40};
        `;
      } else {
        return `
          ${outlineStyles}
        `;
      }
    } else {
      if (p.disabled) {
        return `
          color: ${Colors.black40};
        `;
      } else {
        return `
          &:hover {
             ${outlineStyles}
          }
        `;
      }
    }
  }}

  &:focus-within {
    box-shadow: 0 0 0 2px ${(p) => (p.$hasError ? Colors.red : Colors.focus)};
    .ss-arrow {
      color: black;
    }
  }

  transition: box-shadow 0.1s;
  border-radius: 2px;
  display: inline-block;

  ${Fonts.body};
`;

const IconContainer = styled.div<StyledControlProps>`
  color: ${(p) => (p.$iconBlack ? "black" : Colors.black40)};
  position: absolute;
  left: ${(p) => sizing(p).paddingHorizontal};
  top: ${(p) => sizing(p).paddingVertical};
  pointer-events: none;
`;

/** Map public ControlProps to transient $-prefixed props for styled components */
function toStyledProps(props: ControlProps): StyledControlProps {
  return {
    $icon: props.icon,
    $iconBlack: props.iconBlack,
    $controlSize: props.controlSize,
    $iconOnly: props.iconOnly,
    $withBorder: props.withBorder,
    $hasError: props.hasError,
    disabled: props.disabled,
  };
}

export const ControlContainer: React.FC<
  ControlProps & { children: ReactNode; className?: string }
> = ({ className, children, ...props }) => {
  const Icon = props.icon;
  const styledProps = toStyledProps(props);

  return (
    <Root className={className} {...styledProps}>
      {Icon && (
        <IconContainer {...styledProps}>
          <Icon />
        </IconContainer>
      )}
      {children}
    </Root>
  );
};

export function getControlPadding() {
  return css`
    padding-left: ${(p: StyledControlProps) => sizing(p).paddingIcon};
    padding-right: ${(p: StyledControlProps) => sizing(p).paddingHorizontal};
  `;
}

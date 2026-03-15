import React, { forwardRef } from "react";
import styled from "./styled";
import { Fonts } from "./fonts";

import {
  ControlContainer,
  getControlPadding,
  ControlProps,
} from "./ControlContainer";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  ControlProps & {
    placeholder?: string;
    type?: string;
    debounce?: boolean;
    align?: "left" | "right";
  };

type StyledInputProps = {
  $isRaw?: boolean;
  $controlSize?: any;
  $icon?: any;
  $iconOnly?: boolean;
};

const StyledInput = styled.input<StyledInputProps>`
  all: unset;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  outline: none;
  border: none;

  ::-webkit-search-decoration,
  ::-webkit-search-cancel-button,
  ::-webkit-search-results-button,
  ::-webkit-search-results-decoration {
    display: none;
  }

  ${(p) => !p.$isRaw && getControlPadding()}

  ${Fonts.body};
`;

const InputBase = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    $isRaw?: boolean;
    $controlSize?: any;
    $icon?: any;
    $iconOnly?: boolean;
    align?: "left" | "right";
  }
>(({ align, ...props }, ref) => {
  return (
    <StyledInput
      {...props}
      ref={ref}
      style={align === "right" ? { textAlign: "right" } : undefined}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    iconBlack,
    controlSize,
    iconOnly,
    icon,
    error,
    withBorder,
    hasError,
    debounce,
    onBlur,
    value,
    ...inputProps
  } = props;

  return (
    <ControlContainer
      iconBlack={iconBlack}
      controlSize={controlSize}
      iconOnly={iconOnly}
      icon={icon}
      error={error}
      withBorder={withBorder}
      hasError={hasError}
      disabled={props.disabled}
    >
      <InputBase
        {...inputProps}
        value={value}
        onBlur={onBlur}
        ref={ref}
        $controlSize={controlSize}
        $icon={icon}
        $iconOnly={iconOnly}
      />
    </ControlContainer>
  );
});

export const InputRaw = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      iconBlack,
      controlSize,
      iconOnly,
      icon,
      error,
      withBorder,
      hasError,
      debounce,
      ...htmlProps
    } = props;
    return <InputBase {...htmlProps} ref={ref} $isRaw={true} />;
  },
);

import React, { ReactNode } from "react";
import styled from "./styled";
import { Colors } from "./colors";
import {
  ControlContainer,
  ControlProps,
  getControlPadding,
} from "./ControlContainer";

/**
 * TODO: this toggle button doesn't make much sense from semantic perspective
 */

export type ToggleButtonProps = ControlProps & {
  value?: string;
  selected?: boolean;
  hideLabel?: boolean;
  onChange?: (val: boolean) => void;
};

type StyledToggleButtonProps = {
  $hideLabel?: boolean;
  $selected?: boolean;
  $controlSize?: any;
  $icon?: any;
  $iconOnly?: boolean;
};

const StyledButton = styled.button<StyledToggleButtonProps>`
  all: unset;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  outline: none;
  border: none;
  ${getControlPadding()}
  ${(p) => (p.$hideLabel ? "padding-right: 0;" : "")}
  
  border-radius: 2px;
  background-color: ${(p) => (p.$selected ? Colors.black10 : "transparent")};
`;

export const ToggleButton = (
  props: ToggleButtonProps & {
    children: string /* children must be a string */;
  },
) => {
  const {
    onChange,
    selected,
    hideLabel,
    value,
    icon,
    iconBlack,
    iconOnly,
    controlSize,
    error,
    withBorder,
    hasError,
    disabled,
    children,
    ...restHtmlProps
  } = props;

  return (
    <ControlContainer
      icon={icon}
      iconBlack={true}
      iconOnly={hideLabel}
      controlSize={controlSize}
      error={error}
      withBorder={withBorder}
      hasError={hasError}
      disabled={disabled}
    >
      <StyledButton
        {...restHtmlProps}
        $hideLabel={hideLabel}
        $selected={selected}
        $controlSize={controlSize}
        $icon={icon}
        $iconOnly={iconOnly}
        aria-label={children}
        onClick={() => {
          onChange?.(!selected);
        }}
      >
        {hideLabel ? null : children}
      </StyledButton>
    </ControlContainer>
  );
};

export type SelectInlineProps = {
  children: ReactNode;
  value: string | null | undefined;
  onChange: (value: string) => void;
};

const SelectInlineRoot = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: nowrap;
`;

export const SelectInline: React.FC<SelectInlineProps> = (props) => {
  const buttons = React.Children.toArray(props.children) as React.ReactElement<{
    value: string;
    selected?: boolean;
    onChange?: () => void;
  }>[];

  return (
    <SelectInlineRoot>
      {buttons.map((button) => {
        return React.cloneElement(button, {
          selected: button.props.value === props.value,
          onChange: () => {
            props.onChange(button.props.value);
          },
        });
      })}
    </SelectInlineRoot>
  );
};

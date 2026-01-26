import type { FieldState, FieldSubscription } from "final-form";

/**
 * Props passed to field render components.
 * This is a local definition to avoid dependency on react-final-form which doesn't support React 19.
 * Based on the react-final-form FieldRenderProps type.
 */
export interface FieldInputProps<
  FieldValue,
  T extends HTMLElement = HTMLElement
> {
  name: string;
  onBlur: (event?: React.FocusEvent<T>) => void;
  onChange: (event: React.ChangeEvent<T> | FieldValue) => void;
  onFocus: (event?: React.FocusEvent<T>) => void;
  value: FieldValue;
  checked?: boolean;
  multiple?: boolean;
  type?: string;
}

export interface FieldMetaState<FieldValue> {
  active?: boolean;
  data?: Record<string, any>;
  dirty?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: any;
  initial?: FieldValue;
  invalid?: boolean;
  length?: number;
  modified?: boolean;
  modifiedSinceLastSubmit?: boolean;
  pristine?: boolean;
  submitError?: any;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  visited?: boolean;
}

export interface FieldRenderProps<
  FieldValue,
  T extends HTMLElement = HTMLElement
> {
  input: FieldInputProps<FieldValue, T>;
  meta: FieldMetaState<FieldValue>;
  [otherProp: string]: any;
}

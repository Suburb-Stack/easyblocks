import { InternalField } from "@suburb-stack/core/_internals";
import React from "react";
import type { FieldRenderProps } from "../../form-builder/FieldRenderProps";
import {
  Position,
  PositionPickerInput,
} from "../../../sidebar/PositionPickerInput";
import { wrapFieldsWithMeta } from "./wrapFieldWithMeta";

function PositionField(
  props: FieldRenderProps<Position, HTMLInputElement> & {
    field: InternalField;
  },
) {
  return (
    <PositionPickerInput
      position={props.input.value}
      onPositionChange={(position) => {
        props.input.onChange(position);
      }}
    />
  );
}

export const PositionFieldPlugin = {
  name: "position",
  Component: wrapFieldsWithMeta(PositionField),
};

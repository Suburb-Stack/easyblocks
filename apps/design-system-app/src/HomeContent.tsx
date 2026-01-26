import { Colors } from "@suburb-stack/design-system";
import React from "react";
import { TypographyStories } from "./TypographyStories";
import { ColorStories } from "./ColorStories";
import { ButtonStories } from "./ButtonStories";
import { InputStories } from "./InputStories";
import { ToggleStories } from "./ToggleStories";
import { ModalStories } from "./ModalStories";
import { FormStories } from "./FormStories";
import { ToastStories } from "./ToastStories";
import { RangeSliderStories } from "./RangeSliderStories";
import { SelectStories } from "./SelectStories";
import { ToggleButtonStories } from "./ToggleButtonStories";
import { MultiSelectStories } from "./MultiSelectStories";
import { BasicRowStories } from "./BasicRowStories";
import { NavigationControllerStories } from "./NavigationControllerStories";

function Separator() {
  return (
    <div
      style={{
        width: "100%",
        height: "1px",
        background: Colors.black20,
        marginTop: "32px",
        marginBottom: "16px",
      }}
    ></div>
  );
}

export default function HomeContent() {
  return (
    <>
      <TypographyStories />
      <Separator />
      <ColorStories />
      <Separator />
      <ButtonStories />
      <Separator />
      <InputStories />
      <Separator />
      <ToggleStories />
      <Separator />
      <ModalStories />
      <Separator />
      <FormStories />
      <Separator />
      <ToastStories />
      <Separator />
      <RangeSliderStories />
      <Separator />
      <SelectStories />
      <Separator />
      <ToggleButtonStories />
      <Separator />
      <MultiSelectStories />
      <Separator />
      <BasicRowStories />
      <Separator />
      <NavigationControllerStories />

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </>
  );
}

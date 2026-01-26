import type { WidgetComponentProps } from "@suburb-stack/core";
import { MediaPicker } from "./MediaPicker";

export function MockImagePicker({
  id,
  onChange,
}: WidgetComponentProps<string>) {
  return <MediaPicker id={id} onChange={onChange} mediaType={"image"} />;
}

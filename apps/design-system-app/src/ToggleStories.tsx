import { Toggle, Typography } from "@suburb-stack/design-system";

export function ToggleStories() {
  return (
    <div>
      <Typography variant={"label"}>Toggle</Typography>
      <br />
      <Toggle />
      <br />
      <Typography variant={"body"}>Forced checked</Typography>
      <br />
      <Toggle checked={true} />
    </div>
  );
}

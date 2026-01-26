import { ReactElement } from "react";
import { NoCodeComponentProps } from "../../../types";

function SubmitButtonAction({
  trigger: Trigger,
}: NoCodeComponentProps & { trigger: ReactElement }) {
  return (
    <Trigger.type
      {...(Trigger.props as Record<string, unknown>)}
      type="submit"
    />
  );
}

export { SubmitButtonAction };

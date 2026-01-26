import { NoCodeActionComponentProps } from "../types";

function TriggerEvent({
  trigger: TriggerElement,
  message,
}: NoCodeActionComponentProps) {
  return (
    <TriggerElement.type
      {...(TriggerElement.props as Record<string, unknown>)}
      as="button"
      onClick={() => {
        window.postMessage({
          type: "triggerEvent",
          message,
        });
      }}
    />
  );
}

export { TriggerEvent };

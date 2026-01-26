import { NoCodeActionComponentProps } from "../types";

function Link({ trigger: TriggerElement, url }: NoCodeActionComponentProps) {
  return (
    <TriggerElement.type
      {...(TriggerElement.props as Record<string, unknown>)}
      as="a"
      href={url}
    />
  );
}

export { Link };

import { NoCodeActionComponentProps } from "../types";

function Separator({ Container, Separator }: NoCodeActionComponentProps) {
  return (
    <Container.type {...(Container.props as Record<string, unknown>)}>
      <Separator.type {...(Separator.props as Record<string, unknown>)} />
    </Container.type>
  );
}

export { Separator };

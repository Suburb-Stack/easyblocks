import { NoCodeActionComponentProps } from "../../types";

function DialogContent({ Root, Content }: NoCodeActionComponentProps) {
  return (
    <Root.type {...(Root.props as Record<string, unknown>)}>
      <Content.type {...(Content.props as Record<string, unknown>)} />
    </Root.type>
  );
}

export { DialogContent };

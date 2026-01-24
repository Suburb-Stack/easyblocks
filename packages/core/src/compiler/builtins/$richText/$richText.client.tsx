import React, { ReactElement, ReactNode } from "react";

interface RichTextProps {
  elements: Array<ReactElement>;
  Root: ReactElement<{ children?: ReactNode }>;
}

function RichTextClient(props: RichTextProps) {
  const { elements: Elements, Root } = props;
  const rootProps = Root.props as { children?: ReactNode };

  return (
    <Root.type {...rootProps}>
      {Elements.map((Element, index) => {
        const elementProps = Element.props as Record<string, unknown>;
        return <Element.type {...elementProps} key={index} />;
      })}
    </Root.type>
  );
}

export { RichTextClient };

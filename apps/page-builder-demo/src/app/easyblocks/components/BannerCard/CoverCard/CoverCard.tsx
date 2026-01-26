import React from "react";

export function CoverCard(props: any) {
  const { Root, Background, Overlay } = props;

  return (
    <Root.type {...(Root.props as Record<string, unknown>)}>
      <Background.type {...(Background.props as Record<string, unknown>)} />
      <Overlay.type {...(Overlay.props as Record<string, unknown>)} />
    </Root.type>
  );
}

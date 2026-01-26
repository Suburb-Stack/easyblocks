import React, { ReactElement } from "react";

function SolidColor(props: { Root: ReactElement }) {
  const { Root } = props;
  return <Root.type {...(Root.props as Record<string, unknown>)} />;
}

export { SolidColor };

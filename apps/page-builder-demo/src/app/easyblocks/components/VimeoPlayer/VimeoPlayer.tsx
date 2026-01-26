import React, { ReactElement } from "react";
import { VimeoPlayerInternal } from "./VimeoPlayerInternal";

export function VimeoPlayer(props: {
  AspectRatioMaker: ReactElement;
  ContentWrapper: ReactElement;
  Wrapper: ReactElement;
}) {
  const { AspectRatioMaker, ContentWrapper, Wrapper } = props;

  return (
    <Wrapper.type {...(Wrapper.props as Record<string, unknown>)}>
      <AspectRatioMaker.type
        {...(AspectRatioMaker.props as Record<string, unknown>)}
      />

      <ContentWrapper.type
        {...(ContentWrapper.props as Record<string, unknown>)}
      >
        <VimeoPlayerInternal {...props} />
      </ContentWrapper.type>
    </Wrapper.type>
  );
}

import React, { ReactElement } from "react";

export type SectionProps = {
  Container__: ReactElement;
  Root__: ReactElement;
  BackgroundContainer__: ReactElement;
  Background__: ReactElement;
  HeaderStack: ReactElement;
  HeaderSecondaryStack: ReactElement;
  HeaderStackContainer__: ReactElement;
  SubheaderStackContainer__: ReactElement;
  ContentContainer__: ReactElement;
  headerMode: string;
};

export function SectionWrapper(
  props: {
    _id: string;
    children: any;
  } & SectionProps
) {
  const {
    BackgroundContainer__,
    Background__,
    Container__,
    ContentContainer__,
    HeaderSecondaryStack,
    HeaderStack,
    HeaderStackContainer__,
    Root__,
    SubheaderStackContainer__,
    headerMode,
  } = props;

  return (
    <Root__.type {...(Root__.props as Record<string, unknown>)} id={props._id}>
      {Background__ && (
        <BackgroundContainer__.type
          {...(BackgroundContainer__.props as Record<string, unknown>)}
        >
          <Background__.type
            {...(Background__.props as Record<string, unknown>)}
          />
        </BackgroundContainer__.type>
      )}
      <Container__.type {...(Container__.props as Record<string, unknown>)}>
        {headerMode !== "none" && (
          <HeaderStackContainer__.type
            {...(HeaderStackContainer__.props as Record<string, unknown>)}
          >
            <HeaderStack.type
              {...(HeaderStack.props as Record<string, unknown>)}
            />
          </HeaderStackContainer__.type>
        )}

        {headerMode === "2-stacks" && (
          <SubheaderStackContainer__.type
            {...(SubheaderStackContainer__.props as Record<string, unknown>)}
          >
            <HeaderSecondaryStack.type
              {...(HeaderSecondaryStack.props as Record<string, unknown>)}
            />
          </SubheaderStackContainer__.type>
        )}
        <ContentContainer__.type
          {...(ContentContainer__.props as Record<string, unknown>)}
        >
          {props.children}
        </ContentContainer__.type>
      </Container__.type>
    </Root__.type>
  );
}

import React from "react";

export function BannerCard(props: any) {
  const {
    Container,
    Root,
    Stack,
    StackContainer,
    StackInnerContainer,
    CoverContainer,
    CoverCard,
  } = props;

  return (
    <Root.type {...(Root.props as Record<string, unknown>)}>
      <Container.type {...(Container.props as Record<string, unknown>)}>
        <CoverContainer.type
          {...(CoverContainer.props as Record<string, unknown>)}
        >
          <CoverCard.type {...(CoverCard.props as Record<string, unknown>)} />
        </CoverContainer.type>
        <StackContainer.type
          {...(StackContainer.props as Record<string, unknown>)}
        >
          <StackInnerContainer.type
            {...(StackInnerContainer.props as Record<string, unknown>)}
          >
            <Stack.type {...(Stack.props as Record<string, unknown>)} />
          </StackInnerContainer.type>
        </StackContainer.type>
      </Container.type>
    </Root.type>
  );
}

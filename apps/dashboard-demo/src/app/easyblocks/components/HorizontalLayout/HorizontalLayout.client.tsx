import { NoCodeComponentProps } from "../types";

function HorizontalLayout({
  Container,
  Items,
  itemWrappers,
}: NoCodeComponentProps) {
  return (
    <Container.type {...(Container.props as Record<string, unknown>)}>
      {Items.map((Item: any, index: number) => {
        const OuterWrapper = itemWrappers[index].OuterWrapper;
        const InnerWrapper = itemWrappers[index].InnerWrapper;
        return (
          <OuterWrapper.type
            key={index}
            {...(OuterWrapper.props as Record<string, unknown>)}
          >
            <InnerWrapper.type
              {...(InnerWrapper.props as Record<string, unknown>)}
            >
              <Item.type {...(Item.props as Record<string, unknown>)} />
            </InnerWrapper.type>
          </OuterWrapper.type>
        );
      })}
    </Container.type>
  );
}

export { HorizontalLayout };

import { NoCodeComponentProps } from "../types";

function Stack({
  StackContainer,
  Items,
  outerItemWrappers,
  innerItemWrappers,
}: NoCodeComponentProps) {
  return (
    <StackContainer.type {...(StackContainer.props as Record<string, unknown>)}>
      {Items.map((Item: any, index: number) => {
        const StackItemOuter = outerItemWrappers[index];
        const StackItemInner = innerItemWrappers[index];

        return (
          <StackItemOuter.type
            {...(StackItemOuter.props as Record<string, unknown>)}
            key={index}
          >
            <StackItemInner.type
              {...(StackItemInner.props as Record<string, unknown>)}
            >
              <Item.type {...(Item.props as Record<string, unknown>)} />
            </StackItemInner.type>
          </StackItemOuter.type>
        );
      })}
    </StackContainer.type>
  );
}

export { Stack };

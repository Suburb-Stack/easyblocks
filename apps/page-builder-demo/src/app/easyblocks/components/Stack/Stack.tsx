import React, { ReactElement } from "react";

function Stack(props: {
  StackContainer: ReactElement;
  Items: Array<ReactElement>;
  outerItemWrappers: Array<ReactElement>;
  innerItemWrappers: Array<ReactElement>;
}) {
  const { StackContainer, Items, outerItemWrappers, innerItemWrappers } = props;

  return (
    <StackContainer.type {...(StackContainer.props as Record<string, unknown>)}>
      {Items.map((Item, index) => {
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

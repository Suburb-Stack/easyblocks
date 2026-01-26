import React, { Fragment, ReactElement } from "react";

export function RootSectionStack(props: {
  data: Array<ReactElement>;
  ItemWrappers: Array<ReactElement>;
}) {
  const { data, ItemWrappers: itemWrappers } = props;

  return (
    <Fragment>
      {data.map((Item, index) => {
        const ItemWrapper = itemWrappers[index];

        return (
          <ItemWrapper.type
            {...(ItemWrapper.props as Record<string, unknown>)}
            key={index}
          >
            <Item.type {...(Item.props as Record<string, unknown>)} />
          </ItemWrapper.type>
        );
      })}
    </Fragment>
  );
}

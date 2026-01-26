import React, { ReactElement } from "react";
import type { RichTextBlockElementType } from "../$richTextBlockElement/$richTextBlockElement";

type RichTextLineElementProps = {
  blockType: RichTextBlockElementType;
  elements: Array<React.ReactElement>;
  ListItem: ReactElement;
  TextLine: ReactElement;
};

export function RichTextLineElementClient(props: RichTextLineElementProps) {
  const { blockType, elements: Elements, ListItem, TextLine } = props;
  const elements = Elements.map((Element, index) => {
    const elementProps = Element.props as Record<string, unknown>;
    return <Element.type {...elementProps} key={index} />;
  });

  if (blockType === "paragraph") {
    const textLineProps = TextLine.props as Record<string, unknown>;
    return <TextLine.type {...textLineProps}>{elements}</TextLine.type>;
  }

  if (blockType === "bulleted-list" || blockType === "numbered-list") {
    const listItemProps = ListItem.props as Record<string, unknown>;
    return (
      <ListItem.type {...listItemProps}>
        <div>{elements}</div>
      </ListItem.type>
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      `Unknown @easyblocks/rich-text-line-element blockType "${blockType}"`
    );
  }

  return <div>{elements}</div>;
}

import React, { ReactElement } from "react";
import type { CompiledNoCodeComponentProps } from "../../../types";
import type { RichTextBlockElementComponentConfig } from "./$richTextBlockElement";

type RichTextBlockElementProps = CompiledNoCodeComponentProps<
  RichTextBlockElementComponentConfig["_component"],
  Pick<RichTextBlockElementComponentConfig, "type">
> & {
  elements: Array<ReactElement>;
  Paragraph: ReactElement;
  BulletedList: ReactElement;
  NumberedList: ReactElement;
};

export function RichTextBlockElementClient(props: RichTextBlockElementProps) {
  const {
    type,
    BulletedList,
    elements: Elements,
    NumberedList,
    Paragraph,
  } = props;

  const elements = Elements.map((Element, index) => {
    const elementProps = Element.props as Record<string, unknown>;
    return <Element.type {...elementProps} key={index} />;
  });

  if (type === "paragraph") {
    const paragraphProps = Paragraph.props as Record<string, unknown>;
    return <Paragraph.type {...paragraphProps}>{elements}</Paragraph.type>;
  }

  if (type === "bulleted-list") {
    const bulletedListProps = BulletedList.props as Record<string, unknown>;
    return (
      <BulletedList.type {...bulletedListProps}>{elements}</BulletedList.type>
    );
  }

  if (type === "numbered-list") {
    const numberedListProps = NumberedList.props as Record<string, unknown>;
    return (
      <NumberedList.type {...numberedListProps}>{elements}</NumberedList.type>
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`Unknown @easyblocks/rich-text-block-element type "${type}"`);
  }

  return <div>{elements}</div>;
}

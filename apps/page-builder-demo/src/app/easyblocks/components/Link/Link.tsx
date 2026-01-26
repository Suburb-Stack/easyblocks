export const Link = (props: any) => {
  const { url, shouldOpenInNewWindow, trigger: TriggerElement } = props;

  return (
    <TriggerElement.type
      {...(TriggerElement.props as Record<string, unknown>)}
      as={"a"}
      href={url}
      target={shouldOpenInNewWindow ? "_blank" : undefined}
    />
  );
};

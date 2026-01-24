export const AlertAction = (props: any) => {
  const { text, trigger: TriggerElement } = props;

  return (
    <TriggerElement.type
      {...(TriggerElement.props as Record<string, unknown>)}
      as={"button"}
      onClick={() => {
        alert(text);
      }}
    />
  );
};

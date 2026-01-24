import { NoCodeComponentProps } from "../types";

function ButtonsGroup({ ButtonsContainer, Buttons }: NoCodeComponentProps) {
  return (
    <ButtonsContainer.type
      {...(ButtonsContainer.props as Record<string, unknown>)}
    >
      {Buttons.map((Button: any, index: number) => (
        <Button.type
          {...(Button.props as Record<string, unknown>)}
          key={index}
        />
      ))}
    </ButtonsContainer.type>
  );
}

export { ButtonsGroup };

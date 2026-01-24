import { ReactElement } from "react";

type SimpleBannerProps = {
  Root: ReactElement;
  Title: ReactElement;
  Wrapper: ReactElement;
  Buttons: ReactElement[];
  ButtonsWrapper: ReactElement;
};

export function SimpleBanner(props: SimpleBannerProps) {
  const { Root, Title, Wrapper, Buttons, ButtonsWrapper } = props;

  return (
    <Root.type {...(Root.props as Record<string, unknown>)}>
      <Wrapper.type {...(Wrapper.props as Record<string, unknown>)}>
        <Title.type {...(Title.props as Record<string, unknown>)} />
        <ButtonsWrapper.type
          {...(ButtonsWrapper.props as Record<string, unknown>)}
        >
          {Buttons.map((Button, index) => (
            <Button.type
              {...(Button.props as Record<string, unknown>)}
              key={index}
            />
          ))}
        </ButtonsWrapper.type>
      </Wrapper.type>
    </Root.type>
  );
}

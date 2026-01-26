import { NoCodeComponentProps } from "@suburb-stack/core";

function Code({
  children,
  Wrapper,
}: NoCodeComponentProps & Record<string, any>) {
  return (
    <Wrapper.type {...(Wrapper.props as Record<string, unknown>)}>
      {children}
    </Wrapper.type>
  );
}

export { Code };

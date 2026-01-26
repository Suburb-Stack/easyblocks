import { NoCodeComponentProps } from "@suburb-stack/core";

function TextLink({
  Link,
  url,
  shouldOpenInNewWindow,
  children,
  __easyblocks,
}: NoCodeComponentProps & Record<string, any>) {
  return (
    <Link.type
      {...(Link.props as Record<string, unknown>)}
      href={url}
      target={shouldOpenInNewWindow ? "_blank" : undefined}
      style={{
        backgroundColor: __easyblocks.isSelected ? "#ffff56" : undefined,
      }}
    >
      {children}
    </Link.type>
  );
}

export { TextLink };

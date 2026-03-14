import styled from "../styled";
import type { ComponentType, HTMLAttributes } from "react";

const Wrapper: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
`;

type FrameWrapperProps = {
  $width: number;
  $height: number;
  $transform: string;
};

const FrameWrapper: ComponentType<
  FrameWrapperProps & HTMLAttributes<HTMLDivElement>
> = styled.div.attrs<FrameWrapperProps>(({ $width, $height, $transform }) => {
  return {
    style: {
      width: $width,
      height: $height,
      transform: $transform,
    },
  };
})`
  position: relative;
  z-index: 1;

  display: grid;
  place-items: center;

  transform-origin: left;
`;

export { Wrapper, FrameWrapper };

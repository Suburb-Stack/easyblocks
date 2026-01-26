import {
  useFloating,
  arrow,
  offset,
  flip,
  shift,
  FloatingArrow,
} from "@floating-ui/react";
import { TooltipTriggerAria, useTooltipTrigger } from "@react-aria/tooltip";
import {
  CSSProperties,
  MouseEvent,
  RefCallback,
  useRef,
  useState,
} from "react";

interface TooltipOptions {
  isDisabled?: boolean;
  onClick?: () => void;
}

type TooltipResult = {
  isOpen: boolean;
  arrowProps: {
    ref: RefCallback<HTMLElement>;
    style: CSSProperties;
  };
} & TooltipTriggerAria;

function useTooltip({
  isDisabled,
  onClick,
}: TooltipOptions = {}): TooltipResult {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    placement: "bottom",
    strategy: "absolute",
    middleware: [offset(6), flip(), shift(), arrow({ element: arrowRef })],
  });

  const tooltipTrigger = useTooltipTrigger(
    {
      isDisabled,
      delay: 0,
    },
    {
      isOpen,
      open: () => {
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    },
    refs.reference as React.RefObject<HTMLElement>
  );

  const triggerProps = {
    ref: refs.setReference,
    ...tooltipTrigger.triggerProps,
    onClick:
      onClick === undefined
        ? tooltipTrigger.tooltipProps.onClick
        : (event: MouseEvent<HTMLButtonElement>) => {
            tooltipTrigger.tooltipProps.onClick?.(event);
            onClick();
          },
  };

  const tooltipProps = {
    ref: refs.setFloating,
    style: floatingStyles,
    ...tooltipTrigger.tooltipProps,
  };

  const arrowProps = {
    ref: arrowRef as unknown as RefCallback<HTMLElement>,
    style: {} as CSSProperties,
  };

  return {
    isOpen,
    triggerProps,
    tooltipProps,
    arrowProps,
  };
}

export { useTooltip };

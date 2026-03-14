import React, { ReactNode, useContext, useEffect, useState } from "react";
import styled, { createGlobalStyle } from "../styled";
import { Fonts } from "../fonts";
import { ButtonGhost } from "../buttons";
import { Icons } from "../icons";
import { Colors } from "../colors";
import { InputRaw } from "../Input";
import ReactModal from "react-modal";

type ModalBodyProps = {
  children: ReactNode;
  title?: string;
  headerSymbol?: string;
  headerLine?: boolean;
  searchProps?: object;
  onRequestClose?: () => void;
  width?: string;
  height?: string;
  maxHeight?: string;
  maxWidth?: string;
  noPadding?: boolean;
};

const ModalRoot = styled.div``;

type StyledRootProps = {
  $width?: string;
  $maxWidth?: string;
  $height?: string;
  $maxHeight?: string;
};

const Root = styled.div<StyledRootProps>`
  width: ${(p) => p.$width || "100%"};
  max-width: ${(p) => p.$maxWidth || "none"};
  height: ${(p) => p.$height || "auto"};
  max-height: ${(p) => p.$maxHeight || "none"};
  position: relative;
  box-shadow: 0px 2px 14px rgba(0, 0, 0, 0.15);
  border-radius: 4px;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  background-color: white;

  overflow: hidden;
`;

const HeaderBody = styled.div<{ $headerLine?: boolean }>`
  position: relative;
  ${(p) => p.$headerLine && `border-bottom: 1px solid ${Colors.black10};`}
  color: black;
`;

const ContentBody = styled.div<{ $noPadding?: boolean; $maxHeight?: string }>`
  position: relative;
  overflow-y: ${(p) => (p.$maxHeight == "auto" ? "auto" : "scroll")};
  overflow-x: hidden;
  padding: ${(p) => (p.$noPadding ? "0" : "12px 12px")};
`;

const TitleHeader = styled.div`
  &:not(:empty) {
    padding: 12px;
  }
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TitleHeaderLabel = styled.div`
  ${Fonts.label};
`;

const HeaderLetter = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${Colors.black10};
  ${Fonts.label3};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalBody: React.FC<ModalBodyProps> = ({
  onRequestClose,
  title,
  width,
  height,
  maxHeight,
  maxWidth,
  headerLine,
  noPadding,
  children,
  headerSymbol = "close",
  searchProps,
}) => {
  return (
    <Root
      $width={width}
      $maxWidth={maxWidth}
      $height={height}
      $maxHeight={maxHeight}
    >
      <HeaderBody $headerLine={headerLine}>
        <TitleHeader>
          {title && <TitleHeaderLabel>{title}</TitleHeaderLabel>}
          {searchProps && (
            <InputRaw
              {...searchProps}
              ref={(node) => {
                if (node) {
                  node.focus();
                }
              }}
            />
          )}

          {headerSymbol === "close" && onRequestClose !== undefined && (
            <ButtonGhost
              icon={Icons.Close}
              hideLabel
              onClick={() => {
                if (onRequestClose) {
                  onRequestClose();
                }
              }}
            >
              Close
            </ButtonGhost>
          )}
          {headerSymbol && headerSymbol !== "close" && (
            <HeaderLetter>{headerSymbol}</HeaderLetter>
          )}
        </TitleHeader>
      </HeaderBody>
      <ContentBody $maxHeight={maxHeight} $noPadding={noPadding}>
        {children}
      </ContentBody>
    </Root>
  );
};

type ModalProps = ModalBodyProps & {
  isOpen: boolean;
  mode: "center-small" | "center-huge";
};

const MODES = {
  "center-small": {
    width: "320px",
    maxHeight: "380px",
    extraClass: "",
  },
  "center-huge": {
    width: "80vw",
    maxWidth: "1200px",
    height: "90vh",
    extraClass: "background-shade",
  },
};

export const ModalContext = React.createContext<any>(null);

export const Modal: React.FC<ModalProps> = (props) => {
  const { isOpen, onRequestClose, mode = "center-small", ...bodyProps } = props;

  // Defer isOpen to avoid React-Modal "Cannot register modal instance that's
  // already open" warning when mounting with isOpen={true}
  const [deferredOpen, setDeferredOpen] = useState(false);
  useEffect(() => {
    setDeferredOpen(isOpen);
  }, [isOpen]);

  const parentSelector =
    useContext(ModalContext) ??
    (() => {
      return document.querySelector("#modalContainer");
    });

  if (typeof window === "undefined") {
    return null;
  }

  const { extraClass, ...modeProps } = MODES[mode];

  const content = (
    <ModalRoot>
      <ModalBody
        {...modeProps}
        {...bodyProps}
        onRequestClose={onRequestClose}
      />
    </ModalRoot>
  );

  return (
    <ReactModal
      isOpen={deferredOpen}
      onRequestClose={onRequestClose}
      parentSelector={parentSelector}
      className={{
        base: `Shopstory__ReactModal__Content`,
        afterOpen: `Shopstory__ReactModal__Content--after-open`,
        beforeClose: `Shopstory__ReactModal__Content--before-close`,
      }}
      overlayClassName={{
        base: `Shopstory__ReactModal__Overlay ${extraClass}`,
        afterOpen: `Shopstory__ReactModal__Overlay--after-open ${extraClass}`,
        beforeClose: `Shopstory__ReactModal__Overlay--before-close ${extraClass}`,
      }}
      ariaHideApp={false}
      portalClassName={"Shopstory__ReactModalPortal"}
    >
      {content}
    </ReactModal>
  );
};

export const GlobalModalStyles = createGlobalStyle`
  .Shopstory__ReactModalPortal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .Shopstory__ReactModal__Overlay {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .Shopstory__ReactModal__Overlay:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    z-index: -1;
  }

  .Shopstory__ReactModal__Overlay.background-shade:before {
    background-color: black;
  }

  .Shopstory__ReactModal__Content:focus {
    border: none;
    outline: none;
  }

  .Shopstory__ReactModal__Content__Left:focus {
    border: none;
    outline: none;
  }

  .Shopstory__ReactModal__Content__Left {
    height: 100vh;
    width: 70vw;
    transition: all 350ms cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(-100%);
  }

  .Shopstory__ReactModal__Content__Left.Shopstory__ReactModal__Content__Left--after-open {
    transform: none;
  }

  .Shopstory__ReactModal__Content__Left.Shopstory__ReactModal__Content__Left--before-close {
    transform: translateX(-100%);
  }
`;

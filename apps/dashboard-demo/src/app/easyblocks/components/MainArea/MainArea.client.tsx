import { ReactElement } from "react";
import { NoCodeComponentProps } from "../types";

function MainArea({
  HeaderStack,
  Panels,
  PanelsGrid,
  panelWrappers,
}: NoCodeComponentProps) {
  return (
    <section className="container mx-auto">
      <div className="mb-5">
        <HeaderStack.type {...(HeaderStack.props as Record<string, unknown>)} />
      </div>
      <PanelsGrid.type {...(PanelsGrid.props as Record<string, unknown>)}>
        {(Panels as Array<ReactElement>).map((Panel, index) => {
          const PanelWrapper = panelWrappers[index];

          return (
            <PanelWrapper.type
              key={index}
              {...(PanelWrapper.props as Record<string, unknown>)}
            >
              <Panel.type {...(Panel.props as Record<string, unknown>)} />
            </PanelWrapper.type>
          );
        })}
      </PanelsGrid.type>
    </section>
  );
}

export { MainArea };

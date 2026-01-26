import { NoCodeComponentDefinition } from "@suburb-stack/core";

const appShellFooterDefinition: NoCodeComponentDefinition = {
  id: "AppShellFooter",
  schema: [
    {
      prop: "Items",
      type: "component",
      required: true,
      accepts: ["Stack"],
    },
  ],
  editing() {
    return {
      components: {
        Items: {
          selectable: false,
        },
      },
    };
  },
};

export { appShellFooterDefinition };

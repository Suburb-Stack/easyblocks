import { NoCodeComponentDefinition } from "@suburb-stack/core";

const triggerEventDefinition: NoCodeComponentDefinition = {
  id: "TriggerEvent",
  label: "Trigger Event",
  type: "action",
  schema: [
    {
      prop: "message",
      type: "text",
    },
  ],
};

export { triggerEventDefinition };

import { NoCodeComponentDefinition } from "@suburb-stack/core";

const propertiesFormTextField: NoCodeComponentDefinition = {
  id: "PropertiesFormTextField",
  schema: [
    {
      prop: "property",
      type: "propertyText",
    },
  ],
};

const propertiesFormBooleanField: NoCodeComponentDefinition = {
  id: "PropertiesFormBooleanField",
  schema: [
    {
      prop: "property",
      type: "propertyBoolean",
    },
  ],
};

export { propertiesFormTextField, propertiesFormBooleanField };

import { NoCodeComponentEntry } from "@suburb-stack/core";
import { CompilationContextType } from "@suburb-stack/core/_internals";
import { configMap } from "../config/configMap";

export function addLocalizedFlag(
  config: NoCodeComponentEntry,
  context: CompilationContextType,
) {
  return configMap(config, context, ({ value, schemaProp }) => {
    if (
      (schemaProp.type === "text" && value.id?.startsWith("local.")) ||
      schemaProp.type === "component-collection-localised"
    ) {
      return {
        __localized: true,
        ...value,
      };
    }

    return value;
  });
}

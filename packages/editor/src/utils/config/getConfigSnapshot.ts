import { NoCodeComponentEntry } from "@suburb-stack/core";
import { deepClone } from "@suburb-stack/utils";

/**
 * Outputs comparable config that is FULL COPY of config
 */
function getConfigSnapshot(config: NoCodeComponentEntry): NoCodeComponentEntry {
  const strippedConfig = deepClone(config);
  return strippedConfig;
}
export { getConfigSnapshot };

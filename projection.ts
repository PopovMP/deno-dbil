import type { Doc, Projection } from "./dbil.d.ts";
import { logError } from "@popov/logger";

/**
 * Gets a copy of a doc, which includes only the wanted,
 * or excludes the unwanted properties.
 *
 * The projection is ether inclusive or exclusive.
 */
export function dbProjection(
  doc: Doc,
  projection: Projection,
): Doc | undefined {
  if (
    typeof projection !== "object" ||
    Array.isArray(projection) ||
    projection === null
  ) {
    logError(
      `The projection is not an object. Given: ${projection}`,
      "dbProjection",
    );
    return undefined;
  }

  const projKeys = Object.keys(projection);

  if (projKeys.length === 0) {
    return structuredClone(doc);
  }

  const inclusiveKeysCount: number | undefined = Object
    .values(projection)
    .reduce(
      (sum: number, val: number | undefined): number => sum + (val ? 1 : 0),
      0,
    );

  if (inclusiveKeysCount > 0 && inclusiveKeysCount !== projKeys.length) {
    logError(
      `Mixed projection values. Given: ${JSON.stringify(projection)}`,
      "dbProjection",
    );
    return undefined;
  }

  const output: Doc = {} as Doc;

  if (inclusiveKeysCount > 0) {
    for (const key of projKeys) {
      output[key] = structuredClone(doc[key]);
    }
  } else {
    for (const key of Object.keys(doc)) {
      if (projection[key] === undefined) {
        output[key] = structuredClone(doc[key]);
      }
    }
  }

  return output;
}

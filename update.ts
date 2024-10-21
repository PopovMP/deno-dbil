import { logError } from "@popov/logger";
import type { Doc, EndValue, Update, Value } from "./dbil.d.ts";

/**
 * Updates a document
 */
export function dbUpdate(doc: Doc, update: Update): number {
  if (typeof update !== "object" || Array.isArray(update) || update === null) {
    logError(`The update is not an object. Given: ${update}`, "dbUpdate");
    return 0;
  }

  let numUpdated = 0;
  const operators: string[] = Object.keys(update);

  if (operators.length === 0) {
    logError("The update has no operators", "dbUpdate");
    return 0;
  }

  for (const operator of operators) {
    const operand = update[operator as keyof Update];

    switch (operator) {
      case "$inc":
        for (
          const [field, delta] of Object.entries(
            operand as Record<string, number>,
          )
        ) {
          if (typeof delta !== "number") {
            logError(
              `Cannot $inc with a non-numeric delta. Given: ${delta}`,
              "dbUpdate",
            );
            continue;
          }

          switch (typeof doc[field]) {
            case "number":
              doc[field] += delta;
              numUpdated = 1;
              break;
            case "undefined":
              doc[field] = delta;
              numUpdated = 1;
              break;
            default:
              logError(
                `Cannot $inc field "${field}" of type: ${typeof doc[field]}`,
                "dbUpdate",
              );
          }
        }
        break;

      case "$push":
        for (
          const [field, value] of Object.entries(
            operand as Record<string, Value>,
          )
        ) {
          if (doc[field] === undefined) {
            doc[field] = [structuredClone(value) as EndValue];
            numUpdated = 1;
            continue;
          }

          if (!Array.isArray(doc[field])) {
            logError(
              `Cannot $push to field "${field}" of type: ${typeof doc[field]}`,
              "dbUpdate",
            );
            continue;
          }

          doc[field].push(structuredClone(value) as EndValue);
          numUpdated = 1;
        }
        break;

      case "$rename":
        for (
          const [field, newName] of Object.entries(
            operand as Record<string, string>,
          )
        ) {
          if (field === "_id") {
            logError("Cannot $rename _id", "dbUpdate");
            continue;
          }

          if (typeof newName !== "string") {
            logError(
              `Cannot $rename to a non-string name: ${newName}`,
              "dbUpdate",
            );
            continue;
          }

          if (doc[newName] !== undefined) {
            logError(
              `Cannot $rename to an existing name: ${newName}`,
              "dbUpdate",
            );
            continue;
          }

          if (doc[field] !== undefined) {
            doc[newName] = structuredClone(doc[field]);
            delete doc[field];
            numUpdated = 1;
            continue;
          }

          logError(`Cannot $rename non-existing field: ${field}`, "dbUpdate");
        }
        break;

      case "$set":
        for (
          const [field, value] of Object.entries(
            operand as Record<string, Value>,
          )
        ) {
          if (field === "_id") {
            logError("Cannot $set _id", "dbUpdate");
            continue;
          }

          doc[field] = structuredClone(value);
          numUpdated = 1;
        }
        break;

      case "$unset":
        for (
          const [field, flag] of Object.entries(
            operand as Record<string, 0 | 1 | boolean>,
          )
        ) {
          if (field === "_id") {
            logError("Cannot $unset _id", "dbUpdate");
            continue;
          }

          if (doc[field] !== undefined && flag) {
            delete doc[field];
            numUpdated = 1;
          }
        }
        break;

      default:
        logError(`Wrong update operator. Given: ${operator}`, "dbUpdate");
    }
  }

  return numUpdated;
}

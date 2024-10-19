import { DbTable, Doc, EndValue, Query, QueryOperator } from "./def.ts";
import type { Value } from "./def.ts";
import { logError } from "@popov/logger";

/**
 * Matches query against DB and returns an array of the matched ids.
 * Returns an array of matched ids or an empty array
 */
export function dbQuery(db: DbTable, query: Query): string[] {
  if (!validateQuery(query)) {
    return [];
  }

  const queryKeys: string[] = Object.keys(query);

  // Gets all _id if the query is empty
  if (queryKeys.length === 0) {
    return Object.keys(db);
  }

  // Query a single doc by _id
  if (queryKeys.length === 1 && typeof query._id === "string") {
    return db[query._id] ? [query._id] : [];
  }

  const ids: string[] = [];

  for (const id of Object.keys(db)) {
    if (evalQuery(db[id], query)) {
      ids.push(id);
    }
  }

  return ids;
}

/**
 * Matches query against DB and returns the first match ID or an empty string.
 * Returns the _id of the selected doc or undefined
 */
export function dbQueryOne(db: DbTable, query: Query): string | undefined {
  if (!validateQuery(query)) {
    return undefined;
  }

  const queryKeys: string[] = Object.keys(query);

  // Query a single doc by _id
  if (queryKeys.length === 1 && typeof query._id === "string") {
    return db[query._id] ? query._id : undefined;
  }

  for (const id of Object.keys(db)) {
    if (evalQuery(db[id], query)) {
      return id;
    }
  }

  return undefined;
}

/**
 * Validates query syntax
 * Logs errors if any
 */
function validateQuery(query: Query): boolean {
  if (typeof query !== "object" || Array.isArray(query) || query === null) {
    const qType = Array.isArray(query)
      ? "array"
      : query === null
      ? "null"
      : typeof query;
    logError(`The query is not an object. Given: ${qType}`, "query");
    return false;
  }

  for (const qName of Object.keys(query)) {
    const qVal = query[qName as keyof Query];

    switch (qName) {
      case "$and":
      case "$or":
        if (!Array.isArray(qVal)) {
          logError(
            `${qName} value is not an array. Given: ${typeof qVal}`,
            "query",
          );
          return false;
        }
        if (!qVal.every((qry) => validateQuery(qry as Query))) {
          return false;
        }
        break;

      case "$not":
        if (!validateQuery(qVal as Query)) {
          return false;
        }
        break;

      default:
        if (typeof qVal === "object") {
          for (const [opKey, opVal] of Object.entries(qVal as QueryOperator)) {
            if (!validateOperator(opKey as keyof QueryOperator, opVal)) {
              return false;
            }
          }
        }
    }
  }

  return true;
}

/**
 * Validates a query operator syntax
 */
function validateOperator(
  opKey: keyof QueryOperator,
  opVal: EndValue | EndValue[],
): boolean {
  switch (opKey) {
    case "$exists":
      if (opVal !== true && opVal !== false && opVal !== 1 && opVal !== 0) {
        logError(
          `${opKey} operand is not true, false, 1, or 0. Given: ${typeof opVal}`,
          "query",
        );
        return false;
      }
      break;

    case "$lt":
    case "$lte":
    case "$gt":
    case "$gte":
      if (typeof opVal !== "number" && typeof opVal !== "string") {
        logError(
          `${opKey} operand is not a string or a number. Given: ${typeof opVal}`,
          "query",
        );
        return false;
      }
      break;

    case "$in":
    case "$nin":
      if (!Array.isArray(opVal)) {
        logError(
          `${opKey} operand is not an array. Given: ${typeof opVal}`,
          "query",
        );
        return false;
      }
      break;

    case "$includes":
    case "$eq":
    case "$ne":
      break;

    case "$like":
      if (typeof opVal !== "string") {
        return false;
      }
      break;

    case "$type":
      if (typeof opVal !== "string") {
        logError(
          `${opKey} operand is not a string. Given: ${typeof opVal}`,
          "query",
        );
        return false;
      }
      break;

    default:
      logError(`Unknown query operator. Given: ${opKey}`, "query");
      return false;
  }

  return true;
}

/**
 * Evaluates a query against a doc
 */
function evalQuery(doc: Doc, query: Query): boolean {
  for (const qName of Object.keys(query)) {
    const qVal = query[qName as keyof Query];

    switch (qName) {
      case "$and": {
        for (const qRule of qVal as Query[]) {
          if (!evalQuery(doc, qRule)) {
            return false;
          }
        }
        break;
      }
      case "$or": {
        let isMatch = false;
        for (const qRule of qVal as Query[]) {
          if (evalQuery(doc, qRule)) {
            isMatch = true;
            break;
          }
        }
        if (!isMatch) {
          return false;
        }
        break;
      }
      case "$not": {
        if (evalQuery(doc, qVal as Query)) {
          return false;
        }
        break;
      }
      default: {
        if (typeof qVal === "object") {
          if (!evalOperatorSet(doc[qName], qVal as QueryOperator)) {
            return false;
          }
        } else if (doc[qName] !== qVal) {
          return false;
        }
        break;
      }
    }
  }

  return true;
}

/**
 * Evaluates an operator set against a doc's value
 */
function evalOperatorSet(value: Value, opSet: QueryOperator): boolean {
  for (const key of Object.keys(opSet)) {
    if (
      !evalOperator(
        value,
        key as keyof QueryOperator,
        opSet[key as keyof QueryOperator] as EndValue | EndValue[] | RegExp,
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates a query operator against a doc's value
 */
function evalOperator(
  value: Value,
  opKey: keyof QueryOperator,
  opVal: EndValue | EndValue[] | RegExp,
): boolean {
  switch (opKey) {
    case "$exists":
      return opVal ? value !== undefined : value === undefined;
    case "$lt":
      if (
        (typeof value === "string" && typeof opVal === "string") ||
        (typeof value === "number" && typeof opVal === "number")
      ) {
        return value < opVal;
      }
      return false;
    case "$lte":
      if (
        (typeof value === "string" && typeof opVal === "string") ||
        (typeof value === "number" && typeof opVal === "number")
      ) {
        return value <= opVal;
      }
      return false;
    case "$gt":
      if (
        (typeof value === "string" && typeof opVal === "string") ||
        (typeof value === "number" && typeof opVal === "number")
      ) {
        return value > opVal;
      }
      return false;
    case "$gte":
      if (
        (typeof value === "string" && typeof opVal === "string") ||
        (typeof value === "number" && typeof opVal === "number")
      ) {
        return value >= opVal;
      }
      return false;
    case "$in":
      return (opVal as EndValue[]).includes(value as EndValue);
    case "$includes":
      return (typeof value === "string" || Array.isArray(value)) &&
        value.includes(opVal as string);
    case "$nin":
      return !(opVal as EndValue[]).includes(value as EndValue);
    case "$eq":
      return value === opVal;
    case "$ne":
      return value !== opVal;
    case "$like":
      if (typeof opVal === "string" && typeof value === "string") {
        return new RegExp(opVal, "i").test(value as string);
      }
      return false;
    case "$type": {
      if (opVal === "array") {
        return Array.isArray(value);
      }
      return (typeof value) === opVal;
    }

    default:
      return false;
  }
}

import type { Doc, DocMap } from "./dbil.d.ts";
import { logError } from "@popov/logger";

/**
 * Inserts a doc in DB
 * Returns the id of the newly inserted document or an empty string.
 */
export function dbInsert(docMap: DocMap, doc: Doc): string {
  if (typeof doc !== "object" || Array.isArray(doc) || doc === null) {
    logError(
      "The document being inserted is not an object.",
      "dbInsert",
    );
    return "";
  }

  return typeof doc._id === "string" && doc._id.length > 0
    ? insertDocWithId(docMap, doc)
    : insertDoc(docMap, doc);
}

/**
 * Inserts a doc with an _id.
 * Returns the id of the newly inserted document or an empty string.
 */
function insertDocWithId(docMap: DocMap, doc: Doc): string {
  const id: string = doc._id as string;

  if (docMap[id]) {
    logError(`The _id is not unique. Given: ${id}`, "insertDocWithId");
    return "";
  }

  docMap[id] = structuredClone(doc);

  return id;
}

/**
 * Inserts a doc
 */
function insertDoc(docMap: DocMap, doc: Doc): string {
  const id = makeId(docMap);

  docMap[id] = structuredClone(doc);
  docMap[id]._id = id;

  return id;
}

/**
 * Makes a unique doc id.
 */
function makeId(docMap: DocMap): string {
  const id = uid(16);

  return docMap[id] === undefined ? id : makeId(docMap);
}

/**
 * Generates a random uid
 */
function uid(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  const base64String = btoa(String.fromCharCode(...bytes));
  return base64String.replace(/[+/=]/g, "").slice(0, len);
}

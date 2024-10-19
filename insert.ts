import type { DbTable, Doc } from "./def.ts";
import { logError } from "@popov/logger";

/**
 * Inserts a doc in DB
 * Returns the id of the newly inserted document or an empty string.
 */
export function dbInsert(db: DbTable, doc: Doc): string {
  if (typeof doc !== "object" || Array.isArray(doc) || doc === null) {
    logError(
      "The document being inserted is not an object.",
      "dbInsert",
    );
    return "";
  }

  return typeof doc._id === "string" && doc._id.length > 0
    ? insertDocWithId(db, doc)
    : insertDoc(db, doc);
}

/**
 * Inserts a doc with an _id.
 * Returns the id of the newly inserted document or an empty string.
 */
function insertDocWithId(db: DbTable, doc: Doc): string {
  const id: string = doc._id as string;

  if (db[id]) {
    logError(`The _id is not unique. Given: ${id}`, "insertDocWithId");
    return "";
  }

  db[id] = structuredClone(doc);

  return id;
}

/**
 * Inserts a doc
 */
function insertDoc(db: DbTable, doc: Doc): string {
  const id = makeId(db);

  db[id] = structuredClone(doc);
  db[id]._id = id;

  return id;
}

/**
 * Makes a unique doc id.
 */
function makeId(db: DbTable): string {
  const id = uid(16);

  return db[id] === undefined ? id : makeId(db);
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

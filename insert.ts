import type { DbTable, Doc } from "./dbil.ts";
import { logError } from "@popov/logger";

/**
 * Inserts a doc in DB
 * Returns the id of the newly inserted document or `undefined`
 */
export function dbInsert(db: DbTable, doc: Doc): string | undefined {
  if (typeof doc !== "object" || Array.isArray(doc) || doc === null) {
    logError(
      `The document being inserted is not an object. Given: ${doc}`,
      "dbInsert",
    );
    return;
  }

  return typeof doc._id === "string" && doc._id.length > 0
    ? insertDocWithId(db, doc)
    : insertDoc(db, doc);
}

/**
 * Inserts a doc with an _id
 */
function insertDocWithId(db: DbTable, doc: Doc): string | undefined {
  const id: string = doc._id as string;

  if (db[id]) {
    logError(`The _id is not unique. Given: ${id}`, "insertDocWithId");
    return;
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
 *
 * @param {any} db
 *
 * @return {string}
 */
function makeId(db) {
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

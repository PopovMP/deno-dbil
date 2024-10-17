import { join } from "node:path";
import { logError, logInfo } from "@popov/logger";
import { writeText } from "@popov/file-writer";

import type {
  DbTable,
  Doc,
  InsertOptions,
  ModifyOptions,
  Projection,
  Query,
  Update,
} from "./def.ts";

import { dbQuery, dbQueryOne } from "./query.ts";
import { dbInsert } from "./insert.ts";
import { dbUpdate } from "./update.ts";
import { dbProjection } from "./projection.ts";

let dbDir = "";
const dbHolder: Record<string, DbTable> = {};

export function initDb(dir: string): void {
  dbDir = dir;
}

/**
 * Get the value of a key from the database.
 */
export function getDb(dbName: string): DBil {
  if (dbDir === "") {
    throw new Error("Database directory is not set");
  }

  if (!dbHolder[dbName]) {
    const fileName = join(dbDir, dbName + ".json");

    // Create the DB file if it doesn't exist
    if (!Deno.statSync(fileName)) {
      dbHolder[dbName] = {} as DbTable;
      logInfo(`Database created: ${dbName}, Records: 0`, "DBil :: initDb");
      return new DBil(dbName);
    }

    // Load the DB from the file
    try {
      const content = Deno.readTextFileSync(fileName);
      const db: DbTable = dbHolder[dbName] = JSON.parse(content);
      logInfo(
        `Database loaded: ${dbName}, Records: ${Object.keys(db).length}`,
        "DBil :: initDb",
      );
    } catch (err) {
      logError((err as Error).message, "DBil :: getDB");
      throw new Error("Database read failed");
    }
  }

  return new DBil(dbName);
}

export class DBil {
  dbName: string;
  docRef: DbTable;

  constructor(dbName: string) {
    this.dbName = dbName;
    this.docRef = dbHolder[dbName];
  }

  /**
   * Counts the number of documents in the DB that match the query.
   */
  count(query: Query): number {
    return dbQuery(this.docRef, query).length;
  }

  /**
   * Finds documents in the DB that match the query.
   *
   * Returns an array of matched documents or an empty array.
   */
  find(query: Query, projection: Projection = {}): Doc[] {
    return dbQuery(this.docRef, query)
      .map((id: string): Doc =>
        dbProjection(this.docRef[id], projection) as Doc
      );
  }

  /**
   * Finds the first document in the DB that matches the query.
   *
   * Returns the matched document or `undefined`.
   */
  findOne(query: Query, projection: Projection = {}): Doc | undefined {
    const id: string | undefined = dbQueryOne(this.docRef, query);
    if (!id) return undefined;

    const doc: Doc = this.docRef[id];

    return dbProjection(doc, projection);
  }

  /**
   * Inserts a document in the DB.
   *
   * Returns the id of the newly inserted document or `undefined`.
   */
  insert(
    doc: Doc,
    options: InsertOptions = { skipSave: false },
  ): string | undefined {
    const id: string | undefined = dbInsert(this.docRef, doc);

    if (id && !options.skipSave) {
      this.save();
    }

    return id;
  }

  /**
   * Removes documents from the DB that match the query.
   *
   * Returns the number of removed documents.
   */
  remove(
    query: Query,
    options: ModifyOptions = { multi: false, skipSave: false },
  ): number {
    const ids = dbQuery(this.docRef, query);

    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options.multi) {
      logError("Cannot remove multiple docs without: {multi: true}", "remove");
      return 0;
    }

    for (const id of ids) {
      delete this.docRef[id];
    }

    if (!options.skipSave) {
      this.save();
    }

    return ids.length;
  }

  /**
   * Updates documents in the DB that match the query.
   *
   * Returns the number of updated documents.
   */
  update(
    query: Query,
    update: Update,
    options: ModifyOptions = { multi: false, skipSave: false },
  ): number {
    const ids = dbQuery(this.docRef, query);
    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options.multi) {
      logError(
        "Cannot update multiple docs without: {multi: true}",
        "DBil :: update",
      );
      return 0;
    }

    let numUpdated = 0;
    for (const id of ids) {
      numUpdated += dbUpdate(this.docRef[id], update);
    }

    if (numUpdated > 0 && !options.skipSave) {
      this.save();
    }

    return numUpdated;
  }

  /**
   * Saves the DB to the file system.
   */
  save(): void {
    const content: string = JSON.stringify(this.docRef);
    const filename = join(dbDir, this.dbName + ".json");
    writeText(filename, content);
  }
}

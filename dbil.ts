import { writeText } from "@popov/file-writer";
import { logError, logInfo } from "@popov/logger";

import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

import type {
  DataBase,
  Doc,
  DocMap,
  GetDbOptions,
  InsertOptions,
  Projection,
  Query,
  RemoveOptions,
  Update,
  UpdateOptions,
} from "./dbil.d.ts";

import { dbQuery, dbQueryOne } from "./query.ts";
import { dbInsert } from "./insert.ts";
import { dbUpdate } from "./update.ts";
import { dbProjection } from "./projection.ts";

const dbHolder: Record<string, DataBase> = {};

/**
 * Gets a DB instance.
 *
 * It loads the DB file from the file system if it exists.
 *
 * If the DB file doesn't exist, it creates an empty DB.
 *
 * InMemory DBs are not saved to the file system.
 */
export async function getDb(options: GetDbOptions): Promise<DBil> {
  if (!options.name) {
    logError("DB name is required", "getDb");
    throw new Error("DB name is required");
  }

  options.dirname = options?.dirname || ".";
  options.inMemory = options?.inMemory || false;

  if (options.inMemory) {
    if (dbHolder[options.name] && !dbHolder[options.name].options.inMemory) {
      logError("Persisted DB already exists", "getDb");
      throw new Error("Persisted DB already exists");
    }

    if (!dbHolder[options.name]) {
      dbHolder[options.name] = {
        options,
        docMap: {} as DocMap,
      } as DataBase;
    }

    return new DBil(options.name);
  }

  if (dbHolder[options.name] && dbHolder[options.name].options.inMemory) {
    logError("InMemory DB already exists", "getDb");
    throw new Error("InMemory DB already exists");
  }

  if (!dbHolder[options.name]) {
    const fileName = join(options.dirname, options.name + ".json");

    // Check if the DB file exists
    let isExists = false;
    try {
      const lStat = await stat(fileName);
      if (!lStat.isFile()) {
        logError("Database is not a file", "getDb");
        throw new Error("Database is not a file");
      }
      isExists = true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        logError((err as Error).message, "getDb");
        throw err;
      }
    }

    if (!isExists) {
      dbHolder[options.name] = {
        options,
        docMap: {} as DocMap,
      } as DataBase;

      logInfo(
        `Database created: ${options.name}, Records: 0`,
        "getDb",
      );

      return new DBil(options.name);
    }

    // Load the DB from the file
    try {
      const content = await readFile(fileName, { encoding: "utf-8" });
      const db: DataBase = dbHolder[options.name] = JSON.parse(content);
      logInfo(
        `Database loaded: ${options.name}, Records: ${Object.keys(db).length}`,
        "getDb",
      );
    } catch (err) {
      logError((err as Error).message, "getDB");
      throw new Error("Database read failed");
    }
  }

  return new DBil(options.name);
}

export class DBil {
  options: GetDbOptions;
  docMap: DocMap;

  constructor(dbName: string) {
    this.options = dbHolder[dbName].options;
    this.docMap = dbHolder[dbName].docMap;
  }

  /**
   * Counts the number of documents in the DB that match the query.
   */
  count(query: Query): number {
    return dbQuery(this.docMap, query).length;
  }

  /**
   * Finds documents in the DB that match the query.
   *
   * Returns an array of matched documents or an empty array.
   */
  find(query: Query, projection: Projection = {}): Doc[] {
    return dbQuery(this.docMap, query).map((id: string): Doc =>
      dbProjection(this.docMap[id] as Doc, projection) as Doc
    );
  }

  /**
   * Finds the first document in the DB that matches the query.
   *
   * Returns the matched document or `undefined`.
   */
  findOne(query: Query, projection: Projection = {}): Doc | undefined {
    const id: string | undefined = dbQueryOne(this.docMap, query);
    if (!id) return undefined;

    const doc: Doc = this.docMap[id] as Doc;

    return dbProjection(doc, projection);
  }

  /**
   * Inserts a document in the DB.
   *
   * Returns the id of the newly inserted document or an empty string.
   */
  insert(doc: Doc, options?: InsertOptions): string {
    const id: string = dbInsert(this.docMap, doc);

    if (id !== "" && !options?.skipSave) {
      this.save();
    }

    return id;
  }

  /**
   * Removes documents from the DB that match the query.
   *
   * Returns the number of removed documents.
   */
  remove(query: Query, options?: RemoveOptions): number {
    const ids: string[] = dbQuery(this.docMap, query);

    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options?.multi) {
      logError(
        "Multiple docs selected for removing without {multi: true}",
        "remove",
      );
      return 0;
    }

    for (const id of ids) {
      delete this.docMap[id];
    }

    if (!options?.skipSave) {
      this.save();
    }

    return ids.length;
  }

  /**
   * Updates documents in the DB that match the query.
   *
   * Returns the number of updated documents.
   */
  update(query: Query, update: Update, options?: UpdateOptions): number {
    const ids: string[] = dbQuery(this.docMap, query);
    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options?.multi) {
      logError(
        "Multiple docs selected for updating without: {multi: true}",
        "update",
      );
      return 0;
    }

    let numUpdated = 0;
    for (const id of ids) {
      numUpdated += dbUpdate(this.docMap[id] as Doc, update);
    }

    if (numUpdated > 0 && !options?.skipSave) {
      this.save();
    }

    return numUpdated;
  }

  /**
   * Saves the DB to the file system.
   */
  save(): void {
    if (this.options.inMemory) {
      return;
    }

    const filename = join(
      this.options.dirname as string,
      this.options.name + ".json",
    );

    const content = JSON.stringify({
      options: this.options,
      docMap: this.docMap,
    });

    writeText(filename, content);
  }
}

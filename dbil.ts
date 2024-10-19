import { join } from "@std/path";

import { writeText } from "@popov/file-writer";
import { logError, logInfo } from "@popov/logger";

import type {
  DataBase,
  DBOptions,
  Doc,
  DocMap,
  InsertOptions,
  ModifyOptions,
  Projection,
  Query,
  Update,
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
export async function getDb(options: DBOptions): Promise<DBil> {
  options.dirname = options?.dirname || Deno.cwd();
  options.inMemory = options?.inMemory || false;

  if (options.inMemory) {
    if (!dbHolder[options.name]) {
      dbHolder[options.name] = {
        options,
        docMap: {} as DocMap,
      } as DataBase;
    }
    return new DBil(options.name);
  }

  if (!dbHolder[options.name]) {
    const fileName = join(options.dirname, options.name + ".json");

    // Check if the DB file exists
    let isExists = false;
    try {
      const lStat = await Deno.lstat(fileName);
      if (!lStat.isFile) {
        logError("Database is not a file", "DBil :: initDb");
        throw new Error("Database is not a file");
      }
      isExists = true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        logError((err as Error).message, "DBil :: initDb");
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
        "DBil :: initDb",
      );

      return new DBil(options.name);
    }

    // Load the DB from the file
    try {
      const content = await Deno.readTextFile(fileName);
      const db: DataBase = dbHolder[options.name] = JSON.parse(content);
      logInfo(
        `Database loaded: ${options.name}, Records: ${Object.keys(db).length}`,
        "DBil :: initDb",
      );
    } catch (err) {
      logError((err as Error).message, "DBil :: getDB");
      throw new Error("Database read failed");
    }
  }

  return new DBil(options.name);
}

export class DBil {
  options: DBOptions;
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
  remove(query: Query, options?: ModifyOptions): number {
    const ids: string[] = dbQuery(this.docMap, query);

    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options?.multi) {
      logError(
        "Multiple docs selected for removal without {multi: true}",
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
  update(query: Query, update: Update, options: ModifyOptions): number {
    const ids: string[] = dbQuery(this.docMap, query);
    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options?.multi) {
      logError(
        "Cannot update multiple docs without: {multi: true}",
        "DBil :: update",
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

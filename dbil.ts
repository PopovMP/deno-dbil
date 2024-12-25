import { writeText } from "@popov/file-writer";
import { logError } from "@popov/logger";

import { join } from "node:path";

import type {
  DbOptions,
  Doc,
  DocMap,
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

export class DBil {
  readonly options: DbOptions;
  readonly docMap: DocMap;

  constructor(options: DbOptions, docMap: DocMap) {
    this.options = options;
    this.docMap = docMap;
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
      this.options.dirname || ".",
      this.options.name + ".json",
    );

    const content = JSON.stringify({
      options: this.options,
      docMap: this.docMap,
    });

    writeText(filename, content);
  }
}

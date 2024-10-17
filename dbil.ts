import { join } from "node:path";
import { logError } from "@popov/logger";

import type { DbTable, Doc, InsertOptions, Projection, Query } from "./def.ts";

import { dbQuery, dbQueryOne } from "./query.ts";
import { dbInsert } from "./insert.ts";
import { dbUpdate } from "./update.ts";
import { dbProjection } from "./projection.ts";

const dbHolder: Record<string, DbTable> = {};

export class Dbil {
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
   * @method remove - Removes documents from the DB that match the query.
   *                  Returns the number of removed documents.
   * @param {any} query
   * @param {ModifyOptions} [options={multi: false, skipSave: false}]
   * @returns {number}
   */
  remove(query, options = { multi: false, skipSave: false }) {
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
   * @method update - Updates documents in the DB that match the query.
   *                  Returns the number of updated documents.
   * @param {any} query
   * @param {Object} update
   * @param {ModifyOptions} [options={multi: false, skipSave: false}]
   * @returns {number}
   */
  update(query, update, options = { multi: false, skipSave: false }) {
    const ids = dbQuery(this.docRef, query);
    if (ids.length === 0) {
      return 0;
    }

    if (ids.length > 1 && !options.multi) {
      logError(
        "Cannot update multiple docs without: {multi: true}",
        "json-db :: update",
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
   * @method save - Saves the DB to the file system.
   * @returns {void}
   */
  save() {
    const content: string = JSON.stringify(this.docRef);
    writeText(join(dbDir, this.dbName + ".json"), content);
  }
}

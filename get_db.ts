import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

import { logError, logInfo } from "@popov/logger";

import { DBil } from "./dbil.ts";
import type { DataBase, DbOptions, DocMap } from "./dbil.d.ts";

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
export async function getDb(options: DbOptions): Promise<DBil> {
  // Create a frozen copy of the options
  options = Object.freeze(Object.assign(Object.create(null), options));

  // DB name is required
  if (!options.name) {
    logError("DB name is required", "getDb");
    throw new Error("DB name is required");
  }

  // DB name does not end with .json
  if (options.name.endsWith(".json")) {
    options.name = options.name.slice(0, -5);
  }

  if (options.inMemory) {
    // Cannot create an in-memory DB if a persisted DB exists
    if (dbHolder[options.name] && !dbHolder[options.name].options.inMemory) {
      logError("Persisted DB already exists", "getDb");
      throw new Error("Persisted DB already exists");
    }

    // Create an in-memory DB
    if (!dbHolder[options.name]) {
      if (!options.createIfNotExists) {
        logError("Database does not exist", "getDb");
        throw new Error("Database does not exist");
      }

      dbHolder[options.name] = {
        options,
        docMap: {} as DocMap,
      } as DataBase;
    }

    const db: DataBase = dbHolder[options.name];
    return new DBil(db.options, db.docMap);
  }

  // Cannot create a persisted DB if an in-memory DB exists
  if (dbHolder[options.name] && dbHolder[options.name].options.inMemory) {
    logError("InMemory DB already exists", "getDb");
    throw new Error("InMemory DB already exists");
  }

  if (!dbHolder[options.name]) {
    const dirname = options.dirname || ".";
    const fileName = join(dirname, options.name + ".json");

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
      if (!options.createIfNotExists) {
        logError("Database does not exist", "getDb");
        throw new Error("Database does not exist");
      }

      dbHolder[options.name] = {
        options,
        docMap: {} as DocMap,
      } as DataBase;

      logInfo(
        `Database created: ${options.name}, Records: 0`,
        "getDb",
      );

      const db: DataBase = dbHolder[options.name];
      return new DBil(db.options, db.docMap);
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

  const db: DataBase = dbHolder[options.name];
  return new DBil(db.options, db.docMap);
}

export function closeDb(name: string): void {
  if (dbHolder[name]) {
    delete dbHolder[name];
  } else {
    logError(`DB does not exist: ${name}`, "closeDb");
  }
}

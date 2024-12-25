import { join } from "node:path";
import { stat, unlink } from "node:fs/promises";
import { test } from "node:test";
import { strictEqual } from "node:assert";

import { closeDb, getDb } from "./mod.ts";
import type { DBil } from "./mod.ts";

const dbDir = join(".", "test_files");
const dbFile = join(dbDir, "example.json");

async function unlinkDbFile() {
  // Delete the DB file
  try {
    const stats = await stat(dbFile);
    if (stats.isFile()) {
      await unlink(dbFile);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}

await unlinkDbFile();

test("getDb creates a DB file", async () => {
  // If the file is missing, it gets an empty DB
  const db: DBil = await getDb({
    name: "example",
    dirname: dbDir,
    createIfNotExists: true,
  });

  // It saves the DB to the file system on first modifying request
  db.insert({ name: "Alice" });
  closeDb(db.options.name);

  // Wait for the file to be written
  await pause(100);
  const stats = await stat(dbFile);
  strictEqual(stats.isFile(), true);
});

test("getDb loads a DB file", async () => {
  // If the file exists, it loads the DB
  const db: DBil = await getDb({
    name: "example",
    dirname: dbDir,
    createIfNotExists: true,
  });
  strictEqual(db.find({ name: "Alice" }).length, 1);
  closeDb(db.options.name);

  await unlinkDbFile();
});

test("getDb makes an inMemory DB", async () => {
  const db: DBil = await getDb({
    name: "memory",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "Alice" });
  strictEqual(db.find({ name: "Alice" }).length, 1);
  closeDb(db.options.name);

  // File must not be created
  try {
    const stats = await stat(dbFile);
    strictEqual(stats.isFile(), false);
  } catch (err) {
    strictEqual((err as NodeJS.ErrnoException).code, "ENOENT");
  }
});

/**
 * Pause for a while.
 * @param { number } time - time in milliseconds
 */
function pause(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

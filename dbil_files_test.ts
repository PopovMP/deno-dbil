import { assertEquals } from "@std/assert";
import { join } from "@std/path";

import { getDb } from "./mod.ts";

const dbDir = join(Deno.cwd(), "test_files");
const dbFile = join(dbDir, "example.json");

async function unlinkDbFile() {
  // Delete the DB file
  try {
    const stat = await Deno.lstat(dbFile);
    if (stat.isFile) {
      await Deno.remove(dbFile);
    }
  } catch (err) {
    if ((err as Deno.errors.NotFound).name !== "NotFound") {
      throw err;
    }
  }
}

await unlinkDbFile();

Deno.test("getDb creates a DB file", async () => {
  // If the file is missing, it gets an empty DB
  const db = await getDb({ name: "example", dirname: dbDir });

  // It saves the DB to the file system on first modifying request
  await db.insert({ name: "Alice" });

  // Wait for the file to be written
  await pause(100);

  const stats = await Deno.lstat(dbFile);
  assertEquals(stats.isFile, true);
});

Deno.test("getDb loads a DB file", async () => {
  // If the file exists, it loads the DB
  const db = await getDb({ name: "example", dirname: dbDir });
  assertEquals(db.find({ name: "Alice" }).length, 1);

  await unlinkDbFile();
});

Deno.test("getDb makes an inMemory DB", async () => {
  const db = await getDb({ name: "memory", inMemory: true });
  db.insert({ name: "Alice" });
  assertEquals(db.find({ name: "Alice" }).length, 1);

  // File must not be created
  try {
    const stats = await Deno.lstat(dbFile);
    assertEquals(stats.isFile, false);
  } catch (err) {
    assertEquals(err instanceof Deno.errors.NotFound, true);
  }
});

function pause(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

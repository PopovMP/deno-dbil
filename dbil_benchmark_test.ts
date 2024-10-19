import { assertEquals } from "@std/assert";

import type { DBil } from "./dbil.ts";
import { getDb } from "./mod.ts";

const db: DBil = await getDb({ name: "benchmark", inMemory: true });

const countObjects = 1000;

preheatDb();

Deno.test("insert", () => {
  const timeStart = Date.now();
  let count = 0;

  for (let i = 0; i < countObjects; i++) {
    count += db.insert({ index: i, b: 42 }) ? 1 : 0;
  }

  validate("insert", timeStart, count);
});

Deno.test("find", () => {
  const timeStart = Date.now();
  let count = 0;

  for (let i = 0; i < countObjects; i++) {
    count += db.find({ index: i, b: { $gte: 42 } }, { index: 1 }).length;
  }

  validate("find", timeStart, count);
});

Deno.test("findOne", () => {
  const timeStart = Date.now();
  let count = 0;

  for (let i = 0; i < countObjects; i++) {
    count += db.findOne({ index: i, b: { $gte: 42 } }, { index: 1 }) ? 1 : 0;
  }

  validate("findOne", timeStart, count);
});

Deno.test("findOne by _id", () => {
  const timeStart = Date.now();
  let count = 0;

  const ids = db.find({}, { _id: 1 }).map((doc) => doc._id);

  for (const id of ids) {
    count += db.findOne({ _id: id }, { index: 1 }) ? 1 : 0;
  }

  validate("findOne by _id", timeStart, count);
});

Deno.test("update", () => {
  const timeStart = Date.now();
  let count = 0;

  for (let i = 0; i < countObjects; i++) {
    count += db.update({ index: i, b: { $gte: 42 } }, { $set: { b: 13 } });
  }

  validate("update", timeStart, count);
});

Deno.test("remove", () => {
  const timeStart = Date.now();
  let count = 0;

  for (let i = 0; i < countObjects; i++) {
    count += db.remove({ index: i, b: { $lt: 42 } });
  }

  validate("remove", timeStart, count);
});

function preheatDb(): void {
  // Insert
  for (let i = 0; i < 100; i++) {
    db.insert({ index: i, b: 42 });
  }
  // Find
  for (let i = 0; i < 100; i++) {
    db.find({ index: i, b: { $gte: 42 } }, { index: 1 });
  }
  // FindOne
  for (let i = 0; i < 100; i++) {
    db.findOne({ index: i, b: { $gte: 42 } }, { index: 1 });
  }
  // Update
  for (let i = 0; i < 100; i++) {
    db.update({ index: i, b: { $gte: 42 } }, { $set: { b: 13 } });
  }
  // Remove
  for (let i = 0; i < 100; i++) {
    db.remove({ index: i, b: { $lt: 42 } });
  }
}

function validate(operation: string, timeStart: number, count: number): void {
  const time = Date.now() - timeStart;

  const opsPerSec = Math.round((1000 / (time || 1)) * countObjects);
  console.log(operation, count, "docs for", time, "ms.", opsPerSec, "ops/sec");
  assertEquals(opsPerSec > 5000, true);
}

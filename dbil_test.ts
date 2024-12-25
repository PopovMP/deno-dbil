import { test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";

import { closeDb, getDb } from "./mod.ts";
import type { DBil, Doc } from "./mod.ts";

test("getDb sets the options", async () => {
  const db: DBil = await getDb({
    name: "foo",
    dirname: "bar",
    inMemory: true,
    createIfNotExists: true,
  });
  deepStrictEqual(db.options, {
    name: "foo",
    dirname: "bar",
    inMemory: true,
    createIfNotExists: true,
  });
  closeDb(db.options.name);
});

test("getDb gets ref to the DB", async () => {
  const db1: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  const db2 = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  deepStrictEqual(db1, db2);
  closeDb(db1.options.name);
  closeDb(db2.options.name);
});

test("getDb count all docs", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  strictEqual(db.count({}), 3);
  closeDb(db.options.name);
});

test("getDb count some docs", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  strictEqual(db.count({ name: { $like: "BA" } }), 2);
  closeDb(db.options.name);
});

test("getDb find all docs", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({});
  strictEqual(docs.length, 3);
  closeDb(db.options.name);
});

test("getDb find some docs", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({ name: { $like: "BA" } });
  strictEqual(docs.length, 2);
  closeDb(db.options.name);
});

test("getDb findOne gets a doc", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const doc: Doc = db.findOne({ name: { $like: "BA" } }, { name: 1 }) as Doc;
  strictEqual(doc.name, "bar");
  closeDb(db.options.name);
});

test("getDb inserts docs", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({}, {});
  strictEqual(docs.length, 3);
  closeDb(db.options.name);
});

test("getDb remove one doc", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: "foo" });
  strictEqual(numRemoved, 1);
  closeDb(db.options.name);
});

test("getDb removes multi", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } }, { multi: true });
  strictEqual(numRemoved, 3);
  closeDb(db.options.name);
});

test("getDb does not remove multi", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } });
  strictEqual(numRemoved, 0);
  closeDb(db.options.name);
});

test("getDb update one doc", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update({ name: "foo" }, { $set: { name: "qux" } });
  strictEqual(numUpdated, 1);
  strictEqual(db.count({ name: "qux" }), 1);
  closeDb(db.options.name);
});

test("getDb updates multi", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update(
    { name: { $exists: 1 } },
    { $set: { name: "qux" } },
    { multi: true },
  );
  strictEqual(numUpdated, 3);
  closeDb(db.options.name);
});

test("getDb does not update multi", async () => {
  const db: DBil = await getDb({
    name: "foo",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update(
    { name: { $exists: 1 } },
    { $set: { name: "qux" } },
  );
  strictEqual(numUpdated, 0);
  closeDb(db.options.name);
});

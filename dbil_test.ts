import { test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";

import { getDb } from "./mod.ts";
import type { Doc } from "./mod.ts";

test("getDb sets the options", async () => {
  const db = await getDb({
    name: "foo1",
    dirname: "bar",
    inMemory: true,
    createIfNotExists: true,
  });
  deepStrictEqual(db.options, {
    name: "foo1",
    dirname: "bar",
    inMemory: true,
    createIfNotExists: true,
  });
});

test("getDb gets ref to the DB", async () => {
  const db1 = await getDb({
    name: "foo2",
    inMemory: true,
    createIfNotExists: true,
  });
  const db2 = await getDb({
    name: "foo2",
    inMemory: true,
    createIfNotExists: true,
  });
  deepStrictEqual(db1, db2);
});

test("getDb count all docs", async () => {
  const db = await getDb({
    name: "foo3",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  strictEqual(db.count({}), 3);
});

test("getDb count some docs", async () => {
  const db = await getDb({
    name: "foo4",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  strictEqual(db.count({ name: { $like: "BA" } }), 2);
});

test("getDb find all docs", async () => {
  const db = await getDb({
    name: "foo5",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({});
  strictEqual(docs.length, 3);
});

test("getDb find some docs", async () => {
  const db = await getDb({
    name: "foo6",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({ name: { $like: "BA" } });
  strictEqual(docs.length, 2);
});

test("getDb findOne gets a doc", async () => {
  const db = await getDb({
    name: "foo7",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const doc: Doc = db.findOne({ name: { $like: "BA" } }, { name: 1 }) as Doc;
  strictEqual(doc.name, "bar");
});

test("getDb insers docs", async () => {
  const db = await getDb({
    name: "foo8",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({}, {});
  strictEqual(docs.length, 3);
});

test("getDb remove one doc", async () => {
  const db = await getDb({
    name: "foo9",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: "foo" });
  strictEqual(numRemoved, 1);
});

test("getDb removes multy", async () => {
  const db = await getDb({
    name: "foo10",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } }, { multi: true });
  strictEqual(numRemoved, 3);
});

test("getDb does not remove multy", async () => {
  const db = await getDb({
    name: "foo11",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } });
  strictEqual(numRemoved, 0);
});

test("getDb update one doc", async () => {
  const db = await getDb({
    name: "foo12",
    inMemory: true,
    createIfNotExists: true,
  });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update({ name: "foo" }, { $set: { name: "qux" } });
  strictEqual(numUpdated, 1);
  strictEqual(db.count({ name: "qux" }), 1);
});

test("getDb updates multy", async () => {
  const db = await getDb({
    name: "foo13",
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
});

test("getDb does not update multy", async () => {
  const db = await getDb({
    name: "foo14",
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
});

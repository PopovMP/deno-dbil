import { assertEquals } from "@std/assert";

import { getDb } from "./mod.ts";
import type { Doc } from "./mod.ts";

Deno.test("getDb sets deafult options", async () => {
  const db = await getDb({ name: "example" });
  assertEquals(db.options, {
    name: "example",
    dirname: Deno.cwd(),
    inMemory: false,
  });
});

Deno.test("getDb sets the options", async () => {
  const db = await getDb({ name: "foo1", dirname: "bar", inMemory: true });
  assertEquals(db.options, {
    name: "foo1",
    dirname: "bar",
    inMemory: true,
  });
});

Deno.test("getDb gets ref to the DB", async () => {
  const db1 = await getDb({ name: "foo2", inMemory: true });
  const db2 = await getDb({ name: "foo2", inMemory: true });
  assertEquals(db1, db2);
});

Deno.test("getDb count all docs", async () => {
  const db = await getDb({ name: "foo3", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  assertEquals(db.count({}), 3);
});

Deno.test("getDb count some docs", async () => {
  const db = await getDb({ name: "foo4", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  assertEquals(db.count({ name: { $like: "BA" } }), 2);
});

Deno.test("getDb find all docs", async () => {
  const db = await getDb({ name: "foo5", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({});
  assertEquals(docs.length, 3);
});

Deno.test("getDb find some docs", async () => {
  const db = await getDb({ name: "foo6", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({ name: { $like: "BA" } });
  assertEquals(docs.length, 2);
});

Deno.test("getDb findOne gets a doc", async () => {
  const db = await getDb({ name: "foo7", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const doc: Doc = db.findOne({ name: { $like: "BA" } }, { name: 1 }) as Doc;
  assertEquals(doc.name, "bar");
});

Deno.test("getDb insers docs", async () => {
  const db = await getDb({ name: "foo8", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const docs = db.find({}, {});
  assertEquals(docs.length, 3);
});

Deno.test("getDb remove one doc", async () => {
  const db = await getDb({ name: "foo9", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: "foo" });
  assertEquals(numRemoved, 1);
});

Deno.test("getDb removes multy", async () => {
  const db = await getDb({ name: "foo10", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } }, { multi: true });
  assertEquals(numRemoved, 3);
});

Deno.test("getDb does not remove multy", async () => {
  const db = await getDb({ name: "foo11", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numRemoved = db.remove({ name: { $exists: 1 } });
  assertEquals(numRemoved, 0);
});

Deno.test("getDb update one doc", async () => {
  const db = await getDb({ name: "foo12", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update({ name: "foo" }, { $set: { name: "qux" } });
  assertEquals(numUpdated, 1);
  assertEquals(db.count({ name: "qux" }), 1);
});

Deno.test("getDb updates multy", async () => {
  const db = await getDb({ name: "foo13", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update(
    { name: { $exists: 1 } },
    { $set: { name: "qux" } },
    { multi: true },
  );
  assertEquals(numUpdated, 3);
});

Deno.test("getDb does not update multy", async () => {
  const db = await getDb({ name: "foo14", inMemory: true });
  db.insert({ name: "foo" });
  db.insert({ name: "bar" });
  db.insert({ name: "baz" });
  const numUpdated = db.update(
    { name: { $exists: 1 } },
    { $set: { name: "qux" } },
  );
  assertEquals(numUpdated, 0);
});

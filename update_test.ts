import { assertEquals } from "@std/assert";

import { dbUpdate } from "./update.ts";
import type { Doc } from "./dbil.d.ts";

Deno.test("dbUpdate $inc", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $inc: {val: 5} });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 6);
});

Deno.test("dbUpdate $push", () => {
  const doc: Doc = { _id: "1", vals: [1] };
  const numUpdated = dbUpdate(doc, { $push: {vals: 5} });
  assertEquals(numUpdated, 1);
  assertEquals(doc.vals, [1, 5]);
});

Deno.test("dbUpdate $rename", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $rename: {val: "count"} });
  assertEquals(numUpdated, 1);
  assertEquals(doc.count, 1);
});

Deno.test("dbUpdate $set", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $set: {val: 2} });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 2);
});

Deno.test("dbUpdate $unset 1", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: {val: 1} });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, undefined);
});

Deno.test("dbUpdate $unset 0", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: {val: 0} });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

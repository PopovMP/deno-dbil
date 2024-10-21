import { assertEquals } from "@std/assert";

import { dbUpdate } from "./update.ts";
import type { Doc } from "./dbil.d.ts";

Deno.test("dbUpdate - update cannot be string", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing string input
  const numUpdated = dbUpdate(doc, "not an object");
  assertEquals(numUpdated, 0);
});

Deno.test("dbUpdate - update cannot be null", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing null input
  const numUpdated = dbUpdate(doc, null);
  assertEquals(numUpdated, 0);
});

Deno.test("dbUpdate - update cannot be an array", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing array input
  const numUpdated = dbUpdate(doc, [42]);
  assertEquals(numUpdated, 0);
});

Deno.test("dbUpdate - update without oparator", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, {});
  assertEquals(numUpdated, 0);
});

Deno.test("dbUpdate - update with unlnown oparator", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing unknown operator
  const numUpdated = dbUpdate(doc, { $enlarge: { val: 2 } });
  assertEquals(numUpdated, 0);
});

Deno.test("dbUpdate $inc single val", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $inc: { val: 5 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 6);
});

Deno.test("dbUpdate $inc creates a field", () => {
  const doc: Doc = { _id: "1" };
  const numUpdated = dbUpdate(doc, { $inc: { val: 42 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 42);
});

Deno.test("dbUpdate $inc multiple vals", () => {
  const doc: Doc = { _id: "1", val: 1, coll: 2 };
  const numUpdated = dbUpdate(doc, { $inc: { val: 5, coll: -1 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 6);
  assertEquals(doc.coll, 1);
});

Deno.test("dbUpdate $inc non-numeric delta", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing non-numeric delta
  const numUpdated = dbUpdate(doc, { $inc: { val: "5" } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $inc non-numeric field", () => {
  const doc: Doc = { _id: "1", name: "john" };
  const numUpdated = dbUpdate(doc, { $inc: { name: 1 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.name, "john");
});

Deno.test("dbUpdate $push - single field", () => {
  const doc: Doc = { _id: "1", vals: [1] };
  const numUpdated = dbUpdate(doc, { $push: { vals: 5 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.vals, [1, 5]);
});

Deno.test("dbUpdate $push - multiple fields", () => {
  const doc: Doc = { _id: "1", vals: [1], names: ["john"] };
  const n = dbUpdate(doc, { $push: { vals: 5, names: "anny" } });
  assertEquals(n, 1);
  assertEquals(doc.vals, [1, 5]);
  assertEquals(doc.names, ["john", "anny"]);
});

Deno.test("dbUpdate $push - creates a field", () => {
  const doc: Doc = { _id: "1" };
  const numUpdated = dbUpdate(doc, { $push: { vals: 5 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.vals, [5]);
});

Deno.test("dbUpdate $push - non-array field", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $push: { val: 5 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $rename - single field", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $rename: { val: "count" } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.count, 1);
});

Deno.test("dbUpdate $rename - multiple fields", () => {
  const doc: Doc = { _id: "1", val: 1, coll: 2 };
  const numUpdated = dbUpdate(doc, {
    $rename: { val: "count", coll: "collection" },
  });
  assertEquals(numUpdated, 1);
  assertEquals(doc.count, 1);
  assertEquals(doc.collection, 2);
});

Deno.test("dbUpdate $rename - cannot rename _id", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $rename: { _id: "id" } });
  assertEquals(numUpdated, 0);
  assertEquals(doc._id, "1");
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $rename - non-string new name", () => {
  const doc: Doc = { _id: "1", val: 1 };
  // @ts-expect-error - Testing non-string new name
  const numUpdated = dbUpdate(doc, { $rename: { val: 42 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $rename - existing field", () => {
  const doc: Doc = { _id: "1", val: 1, count: 2 };
  const numUpdated = dbUpdate(doc, { $rename: { val: "count" } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
  assertEquals(doc.count, 2);
});

Deno.test("dbUpdate $rename - non-existing field", () => {
  const doc: Doc = { _id: "1" };
  const numUpdated = dbUpdate(doc, { $rename: { count: "val" } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.count, undefined);
});

Deno.test("dbUpdate $set - single field", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $set: { val: 2 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 2);
});

Deno.test("dbUpdate $set - multiple fields", () => {
  const doc: Doc = { _id: "1", val: 1, coll: 2 };
  const numUpdated = dbUpdate(doc, { $set: { val: 2, coll: 3 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 2);
  assertEquals(doc.coll, 3);
});

Deno.test("dbUpdate $set - creates a field", () => {
  const doc: Doc = { _id: "1" };
  const numUpdated = dbUpdate(doc, { $set: { val: 2 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, 2);
});

Deno.test("dbUpdate $set - cannot set _id", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $set: { _id: "2" } });
  assertEquals(numUpdated, 0);
  assertEquals(doc._id, "1");
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $unset 1", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: { val: 1 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, undefined);
});

Deno.test("dbUpdate $unset 0", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: { val: 0 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $unset - multiple fields", () => {
  const doc: Doc = { _id: "1", val: 1, coll: 2 };
  const numUpdated = dbUpdate(doc, { $unset: { val: 1, coll: 1 } });
  assertEquals(numUpdated, 1);
  assertEquals(doc.val, undefined);
  assertEquals(doc.coll, undefined);
});

Deno.test("dbUpdate $unset - non-existing field", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: { count: 1 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc.val, 1);
});

Deno.test("dbUpdate $unset - _id", () => {
  const doc: Doc = { _id: "1", val: 1 };
  const numUpdated = dbUpdate(doc, { $unset: { _id: 1 } });
  assertEquals(numUpdated, 0);
  assertEquals(doc._id, "1");
  assertEquals(doc.val, 1);
});

// dbUpdate - using multiple operators
Deno.test("dbUpdate - using multiple operators", () => {
  const doc: Doc = { _id: "1", val: 1, coll: 2 };
  const numUpdated = dbUpdate(doc, {
    $inc: { val: 5, coll: -1 },
    $push: { vals: 5, names: "anny" },
    $rename: { val: "count", coll: "collection" },
    $set: { name: "john" },
    $unset: { val: 1 },
  });
  assertEquals(numUpdated, 1);
  assertEquals(doc.count, 6);
  assertEquals(doc.collection, 1);
  assertEquals(doc.vals, [5]);
  assertEquals(doc.names, ["anny"]);
  assertEquals(doc.name, "john");
  assertEquals(doc.val, undefined);
});

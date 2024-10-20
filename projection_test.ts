import { assertEquals } from "@std/assert";

import { dbProjection } from "./projection.ts";
import type { Doc } from "./dbil.d.ts";

Deno.test("dbProjection gets compelte doc given {}", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, {}) as Doc;

  assertEquals(res._id, doc._id);
  assertEquals(res.val, doc.val);
  assertEquals(res.name, doc.name);
});

Deno.test("dbProjection gets compelte doc", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { _id: 1, val: 1, name: 1 }) as Doc;

  assertEquals(res._id, doc._id);
  assertEquals(res.val, doc.val);
  assertEquals(res.name, doc.name);
});

Deno.test("dbProjection gets partial doc", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { _id: 1, val: 1 }) as Doc;

  assertEquals(res._id, doc._id);
  assertEquals(res.val, doc.val);
  assertEquals(res.name, undefined);
});

Deno.test("dbProjection does not get _id by default", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { val: 1 }) as Doc;

  assertEquals(res._id, undefined);
  assertEquals(res.val, doc.val);
});

Deno.test("dbProjection accepts excluding values", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { name: 0 }) as Doc;

  assertEquals(res._id, doc._id);
  assertEquals(res.val, doc.val);
  assertEquals(res.name, undefined);
});

Deno.test("dbProjection does not accept mixed values", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc | undefined = dbProjection(doc, { val: 1, name: 0 });

  assertEquals(res, undefined);
});

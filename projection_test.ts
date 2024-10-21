import { test } from "node:test";
import { strictEqual } from "node:assert";

import { dbProjection } from "./projection.ts";
import type { Doc } from "./dbil.d.ts";

test("dbProjection gets compelte doc given {}", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, {}) as Doc;

  strictEqual(res._id, doc._id);
  strictEqual(res.val, doc.val);
  strictEqual(res.name, doc.name);
});

test("dbProjection gets compelte doc", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { _id: 1, val: 1, name: 1 }) as Doc;

  strictEqual(res._id, doc._id);
  strictEqual(res.val, doc.val);
  strictEqual(res.name, doc.name);
});

test("dbProjection gets partial doc", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { _id: 1, val: 1 }) as Doc;

  strictEqual(res._id, doc._id);
  strictEqual(res.val, doc.val);
  strictEqual(res.name, undefined);
});

test("dbProjection does not get _id by default", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { val: 1 }) as Doc;

  strictEqual(res._id, undefined);
  strictEqual(res.val, doc.val);
});

test("dbProjection accepts excluding values", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc = dbProjection(doc, { name: 0 }) as Doc;

  strictEqual(res._id, doc._id);
  strictEqual(res.val, doc.val);
  strictEqual(res.name, undefined);
});

test("dbProjection does not accept mixed values", () => {
  const doc: Doc = { _id: "1", val: 13, name: "Alice" };

  const res: Doc | undefined = dbProjection(doc, { val: 1, name: 0 });

  strictEqual(res, undefined);
});

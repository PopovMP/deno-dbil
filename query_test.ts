import { assertEquals } from "@std/assert";

import { dbQuery, dbQueryOne } from "./query.ts";
import type { DocMap } from "./dbil.d.ts";

function getDocMap(): DocMap {
  return {
    "1": { _id: "1", name: "foo", val: 1, vals: [1] },
    "2": { _id: "2", name: "bar", val: 2, vals: [1, 2] },
    "3": { _id: "3", name: "baz", val: 3, vals: [1, 2, 3] },
  } as DocMap;
}

Deno.test("dbQuery gets all _id if the query is empty", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, {});
  assertEquals(ids.length, 3);
  assertEquals(ids[0], "1");
});

Deno.test("dbQuery gets a single doc by _id", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { _id: "3" });
  assertEquals(ids.length, 1);
  assertEquals(ids[0], "3");
});

Deno.test("dbQueryOne gets first _id if the query is empty", () => {
  const docMap: DocMap = getDocMap();
  const id: string = dbQueryOne(docMap, {}) as string;
  assertEquals(id, "1");
});

Deno.test("dbQueryOne gets a single doc by _id", () => {
  const docMap: DocMap = getDocMap();
  const id: string = dbQueryOne(docMap, { _id: "3" }) as string;
  assertEquals(id, "3");
});

Deno.test("$exists when $exists: 1", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $exists: 1 } });
  assertEquals(ids.length, 3);
});

Deno.test("$exists when $exists: 0 and props", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $exists: 0 } });
  assertEquals(ids.length, 0);
});

Deno.test("$exists when $exists: 0 and no props", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { foo: { $exists: 0 } });
  assertEquals(ids.length, 3);
});

Deno.test("$lt by string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { _id: { $lt: "3" } });
  assertEquals(ids.length, 2);
});

Deno.test("$lt by number", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $lt: 3 } });
  assertEquals(ids.length, 2);
});

Deno.test("$lte by string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { _id: { $lte: "3" } });
  assertEquals(ids.length, 3);
});

Deno.test("$lte by number", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $lte: 3 } });
  assertEquals(ids.length, 3);
});

Deno.test("$gt by string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { _id: { $gt: "1" } });
  assertEquals(ids.length, 2);
});

Deno.test("$gt by number", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $gt: 1 } });
  assertEquals(ids.length, 2);
});

Deno.test("$gte by string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { _id: { $gte: "1" } });
  assertEquals(ids.length, 3);
});

Deno.test("$gte by number", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { $gte: 1 } });
  assertEquals(ids.length, 3);
});

Deno.test("$in", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { "$in": [1, 2, 4] } });
  assertEquals(ids.length, 2);
  assertEquals(ids[0], "1");
  assertEquals(ids[1], "2");
});

Deno.test("$nin", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { "$nin": [1, 2, 4] } });
  assertEquals(ids.length, 1);
  assertEquals(ids[0], "3");
});

Deno.test("$includes string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { name: { "$includes": "ba" } });
  assertEquals(ids.length, 2);
  assertEquals(ids[0], "2");
  assertEquals(ids[1], "3");
});

Deno.test("$includes array", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { vals: { "$includes": 2 } });
  assertEquals(ids.length, 2);
  assertEquals(ids[0], "2");
  assertEquals(ids[1], "3");
});

Deno.test("$eq", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { "$eq": 2 } });
  assertEquals(ids.length, 1);
  assertEquals(ids[0], "2");
});

Deno.test("$ne", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { val: { "$ne": 2 } });
  assertEquals(ids.length, 2);
  assertEquals(ids[0], "1");
  assertEquals(ids[1], "3");
});

Deno.test("$like", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { name: { "$like": "Ba" } });
  assertEquals(ids.length, 2);
  assertEquals(ids[0], "2");
  assertEquals(ids[1], "3");
});

Deno.test("$type string", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { name: { "$type": "string" } });
  assertEquals(ids.length, 3);
});

Deno.test("$type array", () => {
  const docMap: DocMap = getDocMap();
  const ids: string[] = dbQuery(docMap, { vals: { "$type": "array" } });
  assertEquals(ids.length, 3);
});

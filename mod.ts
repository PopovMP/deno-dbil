/**
 * Simple, embedded, persisted or in-memory, document-oriented database
 *
 * Syntax similar to MongoDB.
 *
 * Example:
 *
 * ```typescript
 * import { getDb } from "@popov/dbil";
 *
 * const dirname = Deno.cwd() + "/db";
 * const db = getDb({ name: "test", dirname, createIfNotExists: true });
 * //=> 2024-10-20 04:40:17 [INFO] [getDb] Database created: test, Records: 0
 *
 * db.insert({ name: "John", age: 25 });
 * // Creates a file: ./db/test.json
 *
 * db.insert({ name: "Alice", age: 19 });
 *
 * const docs = db.find({ age: {$gt: 20} });
 *
 * console.log(docs.length); //=> 1
 * console.log(docs[0]);
 * //=> { _id: "e443a7cc23bb23b8", name: "John", age: 25 }
 *
 * db.update({ name: "Alice" }, { $set: { age: 21 } });
 *
 * const doc = db.findOne({ name: "Alice" }, { name: 1, age: 1 });
 * console.log(doc);
 * //=> { name: "Alice", age: 21 }
 *
 * const count = db.count({ age: {$gt: 20} });
 * console.log(count); //=> 2
 *
 * const countRemoved = db.remove({ name: "Alice" });
 * console.log(countRemoved); // 1
 *
 * db.close();
 * ```
 *
 * @module dbil
 */

export * from "./dbil.d.ts";
export * from "./dbil.ts";

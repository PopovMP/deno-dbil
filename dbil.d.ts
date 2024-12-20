/**
 * The atomic value.
 *
 * It can be a number, a string, a boolean, or null.
 */
export type EndValue = number | string | boolean | null;

/**
 * The value of a field in a document.
 *
 * It can be an atomic value, an array of atomic values, or a record.
 */
export type Value =
  | EndValue
  | EndValue[]
  | Record<string, EndValue | EndValue[] | Record<string, EndValue>>;

/**
 * Doc interface describe a document in the database.
 *
 * - `_id`: The unique identifier of the document.
 *
 * The document contains fields with values.
 *
 * The filed name cannot start with `$`
 *
 * The values can be atomic values, arrays of atomic values, or records.
 */
export interface Doc {
  _id?: string;
  [property: string]: Value | undefined;
}

/**
 * Operator interface describes the query operators.
 *
 * - `$exists` - used to select docs by availability of a field.
 *   It accepts: true, false, 1, or 0.
 *   { name: { $exists: 1 } } - selects docs with the field `name`.
 *   { name: { $exists: 0 } } - selects docs without the field `name`.
 *
 * - `$eq` - used to select docs with a field equal to a value.
 *   $eq accepts a number or a string.
 *   { age: { $eq: 25 } } - selects docs with the field `age` equal to 25.
 *
 * - `$ne` - used to select docs with a field not equal to a value.
 *   $ne accepts a number or a string.
 *   { age: { $ne: 25 } } - selects docs with the field `age` not equal to 25.
 *
 * - `$gt` - used to select docs with a field greater than a value.
 *   $gt accepts a number or a string.
 *   { age: { $gt: 25 } } - selects docs with the field `age` greater than 25.
 *
 * - `$gte` - used to select docs with a field greater than or equal to a value.
 *  $gte accepts a number or a string.
 *  { age: { $gte: 25 } } - selects docs with the field `age` greater than or equal to 25.
 *
 * - `$lt` - used to select docs with a field less than a value.
 *  $lt accepts a number or a string.
 *  { age: { $lt: 25 } } - selects docs with the field `age` less than 25.
 *
 * - `$lte` - used to select docs with a field less than or equal to a value.
 *  $lte accepts a number or a string.
 *  { age: { $lte: 25 } } - selects docs with the field `age` less than or equal to 25.
 *
 * - `$in` - used to select docs with a field equal to one of the values in an array.
 *  $in accepts an array of strings or numbers.
 *  { age: { $in: [25, 30] } } - selects docs with the field `age` equal to 25 or 30.
 *
 * - `$nin` - used to select docs with a field not equal to any of the values in an array.
 *  $nin accepts an array of strings or numbers.
 *  { age: { $nin: [25, 30] } } - selects docs with the field `age` not equal to 25 or 30.
 *
 * - `$includes` - used to select docs with a field that includes a value.
 *  $includes accepts a string.
 *  { name: { $includes: "John" } } - selects docs with the field `name` that includes "John".
 *
 * - `$like` - used to select docs with a field that matches a pattern.
 * $like accepts a string.
 * { name: { $like: "JoHn" } } - selects docs with the field `name` containing "john" case insentitivel.
 *
 * - `$type` - used to select docs with a field of a specific type.
 *  $type accepts a string: "number", "string", "boolean", "null", "array", or "object".
 *  { age: { $type: "number" } } - selects docs with the field `age` of type number.
 */
export interface QueryOperator {
  $exists?: boolean | 1 | 0;
  $eq?: number | string;
  $ne?: number | string;
  $gt?: number | string;
  $gte?: number | string;
  $lt?: number | string;
  $lte?: number | string;
  $in?: string[] | number[];
  $nin?: string[] | number[];
  $includes?: EndValue;
  $like?: string;
  $type?: "number" | "string" | "boolean" | "null" | "array" | "object";
}

/**
 * The query interface describes a query to select documents from the database.
 */
export interface Query {
  _id?: string | QueryOperator;
  [property: string]: Value | QueryOperator | undefined;
}

/**
 * The projections sets what fields to include or exclude from the query result.
 *
 * The `_id` field is not included by default.
 *
 * Projections accepts either fields to include or exclude.
 */
export interface Projection {
  _id?: 1 | 0;
  [propery: string]: 1 | 0 | undefined;
}

/**
 * The database options.
 *
 * - `$dirname`: The directory name of the DB file.
 *
 * - `$name`: The name of the DB. The actual file name is `${$name}.json`.
 *
 * - `$inMemory`: A boolean that indicates if the DB is in-memory.
 */
export interface GetDbOptions {
  dirname?: string;
  name: string;
  inMemory?: boolean;
  createIfNotExists?: boolean;
}

/**
 * DocMap describes the map of documents in the database.
 */
export interface DocMap {
  [id: string]: Doc;
}

/**
 * The DataBase interface describes the database.
 *
 * - `options`: The database options.
 *
 * - `docMap`: The map of documents in the database.
 */
export interface DataBase {
  options: GetDbOptions;
  docMap: DocMap;
}

/**
 * Update operators
 *
 * - `$inc` - used to increment a field by a number.
 *  { $inc: { age: 1 } } - increments the field `age` by 1.
 *  { $inc: { age: -1 } } - decrements the field `age` by 1.
 *  { $inc: { age: 5 } } - increments the field `age` by 5.
 *  { $inc: { val: 1, col: 3 } } - increments multiple fields
 *
 * - `$push` - used to append a value to an array field.
 * { $push: { tags: "new" } } - appends "new" to the `tags` array.
 *
 * - `$rename` - used to rename a field.
 *  { $rename: { old: "new" } } - renames the field `old` to `new`.
 *  Cannot rename the _id field.
 *
 * - `$set` - used to set a field to a value.
 *  { $set: { name: "John" } } - sets the field `name` to "John".
 *  { $set: { name: "John", age: 25 } } - sets multiple fields.
 *  Cannot set the _id field.
 *
 * - `$unset` - used to remove a field.
 *  { $unset: { name: 1 } } - removes the field `name`.
 *  { $unset: { name: true } } - removes the field `name`.
 *  { $unset: { name: 0 } } - does not remove the field `name`.
 *  Cannot remove the _id field.
 */
export interface Update {
  $inc?: Record<string, number>;
  $push?: Record<string, Value>;
  $rename?: Record<string, string>;
  $set?: Record<string, Value>;
  $unset?: Record<string, 0 | 1 | boolean>;
}

/**
 * The insert options.
 *
 *  - `skipSave`: A boolean that indicates if the insert should skip saving the database.
 */
export interface InsertOptions {
  skipSave?: boolean;
}

/**
 * The `update` options.
 *  - `multi`: A boolean that indicates if the update should update multiple documents.
 *  - `skipSave`: A boolean that indicates if the update should skip saving the database.
 */
export interface UpdateOptions {
  multi?: boolean;
  skipSave?: boolean;
}

/**
 * The `remove` options.
 *  - `multi`: A boolean that indicates if the remove should remove multiple documents.
 *  - `skipSave`: A boolean that indicates if the remove should skip saving the database.
 */
export interface RemoveOptions {
  multi?: boolean;
  skipSave?: boolean;
}

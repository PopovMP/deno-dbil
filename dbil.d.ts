export type EndValue = string | number | boolean | null;
export type Value =
  | EndValue
  | Record<string, EndValue | EndValue[] | Record<string, EndValue>>
  | EndValue[];

export interface Doc {
  _id?: string;
  [property: string]: Value | undefined;
}

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
  $includes?: string | number;
  $like?: string;
  $type?: string;
}

export interface Query {
  _id?: string;
  [property: string]: Value | QueryOperator | undefined;
}

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
export interface DBOptions {
  dirname?: string;
  name: string;
  inMemory?: boolean;
}

export interface DocMap {
  [id: string]: Doc;
}

export interface DataBase {
  options: DBOptions;
  docMap: DocMap;
}

export interface Update {
  $inc?: Record<string, number>;
  $push?: Record<string, Value>;
  $rename?: Record<string, string>;
  $set?: Record<string, Value>;
  $unset?: Record<string, 0 | 1 | boolean>;
}

export interface InsertOptions {
  skipSave?: boolean;
}

export interface UpdateOptions {
  multi?: boolean;
  skipSave?: boolean;
}

export interface RemoveOptions {
  multi?: boolean;
  skipSave?: boolean;
}

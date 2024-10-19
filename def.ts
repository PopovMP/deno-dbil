export type EndValue = string | number | boolean | null;
export type Value =
  | EndValue
  | Record<string, EndValue | EndValue[] | Record<string, EndValue>>
  | EndValue[];

export type Doc =
  & { _id?: string }
  & Record<string, Value>;

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

export type QueryClouse = Record<string, Value | QueryOperator>;

export interface QueryGroup {
  $and?: QueryClouse[];
  $or?: QueryClouse[];
  $not?: QueryClouse;
  _id?: string;
}

export type Query = QueryClouse | QueryGroup;

export type Projection = { _id?: 1 | 0 } & Record<string, 1 | 0>;

export type DbTable = Record<string, Doc>;

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

export interface ModifyOptions {
  multi?: boolean;
  skipSave?: boolean;
}

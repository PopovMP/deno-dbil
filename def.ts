export type EndValue = string | number | boolean | null;
export type ObjValue = Record<
  string,
  EndValue | EndValue[] | Record<string, EndValue>
>;

export type Doc =
  & { _id?: string }
  & Record<string, EndValue | EndValue[] | ObjValue>;

export interface QueryOperator {
  $exists?: boolean | 1 | 0;
  $eq?: number | string;
  $ne?: number | string;
  $gt?: number | string;
  $gte?: number | string;
  $lt?: number | string;
  $lte?: number | string;
  $in?: EndValue[];
  $nin?: EndValue[];
  $includes?: EndValue;
  $regex?: RegExp;
  $type?: string;
}

export type QueryClouse = Record<string, EndValue | QueryOperator>;

export interface QueryGroup {
  $and?: QueryClouse[];
  $or?: QueryClouse[];
  $not?: QueryClouse;
  $where?: (doc: Doc) => boolean;
  _id?: string;
}

export type Query = QueryClouse | QueryGroup;

export type Projection = { _id?: 1 | 0 } & Record<string, 1 | 0>;

export type DbTable = Record<string, Doc>;

export interface Update {
  $inc?: Record<string, number>;
  $push?: Record<string, EndValue>;
  $rename?: Record<string, string>;
  $set?: Record<string, EndValue | EndValue[] | ObjValue>;
  $unset?: Record<string, 0 | 1 | boolean>;
}

export interface InsertOptions {
  skipSave?: boolean;
}

export interface ModifyOptions {
  multi?: boolean;
  skipSave?: boolean;
}

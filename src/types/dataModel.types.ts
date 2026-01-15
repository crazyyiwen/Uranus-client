// Types for Data Model Manager

export type Segments = string | string[];

export enum StoreAction {
  register = 'register',
  deregister = 'deregister',
  edit = 'edit',
  extend = 'extend',
}

export interface IStorePatch {
  patchId: string;
  storeId: string;
  firstChange: boolean;
  timestamp: number;
  patchedPath?: string;
  patchedSegments?: string[];
  patchedValue?: any;
  previousValue?: any;
  operation: StoreAction;
  innerAction: boolean;
}

export interface IStoreChange {
  store: Map<string, any> | undefined;
  patch: IStorePatch;
}

export interface IDataModelSubscriber {
  (change: IStoreChange): void;
}

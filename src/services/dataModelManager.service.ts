import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as _ from 'lodash';
import { v4 as generateUid } from 'uuid';
import type {
  Segments,
  IStoreChange,
  IStorePatch,
  StoreAction,
  IDataModelSubscriber,
} from '@/types/dataModel.types';
import { StoreAction as StoreActionEnum } from '@/types/dataModel.types';

/**
 * Data Model Manager Service
 *
 * Manages data models with change tracking, immutability, and undo/redo support.
 * Similar to Angular's DmDataModelManagerService but adapted for React with Zustand.
 *
 * Features:
 * - Register/Deregister data models by ID
 * - Immutable updates with deep cloning
 * - Change tracking with patch history
 * - Path-based getters/setters (e.g., "user.profile.name")
 * - Subscribe to changes
 * - Undo/Redo support via patch application
 */

interface DataModelManagerState {
  // Internal state
  dataModels: Map<string, any>;
  storeChanges: IStorePatch[];
  lastChange: IStoreChange | null;

  // Actions
  registerDataModel: (
    dataModelId: string,
    dataModel: any,
    overwrite?: boolean,
    isMutable?: boolean
  ) => void;
  deregisterDataModel: (dataModelId: string) => void;
  has: (dataModelId: string) => boolean;
  hasIn: (dataModelId: string, path: Segments) => boolean;
  getById: (dataModelId: string) => any;
  getIn: (dataModelId: string, path: Segments) => any;
  setIn: (dataModelId: string, path: Segments, value: any) => void;
  extend: (
    storeId: string,
    path: Segments,
    value: any,
    overwrite?: boolean
  ) => void;
  applyPatch: (patchId: string) => void;
  getStoreChanges: () => IStorePatch[];
  clearHistory: () => void;

  // Internal methods
  _notifyChanges: (change: IStoreChange) => void;
  _immuteRoot: (dataModelId: string) => any;
  _shouldImmute: (
    storeId: string,
    path: Segments,
    newValue: any
  ) => any | undefined;
}

/**
 * Zustand store for Data Model Manager
 */
export const useDataModelManager = create<DataModelManagerState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    dataModels: new Map<string, any>(),
    storeChanges: [],
    lastChange: null,

    // Register a new data model
    registerDataModel: (
      dataModelId: string,
      dataModel: any,
      overwrite: boolean = false,
      isMutable: boolean = false
    ) => {
      const state = get();

      // Validations
      if (!dataModelId) {
        throw new Error('Data Models Manager Error: Invalid data model ID!');
      }
      if (dataModel === undefined) {
        throw new Error('Data Models Manager Error: Invalid data model!');
      }
      if (state.dataModels.has(dataModelId) && !overwrite) {
        throw new Error(
          `Data Models Manager Error: Invalid data model ID! Data Model with the same ID already registered '${dataModelId}'. If you intend to overwrite existing data model, please register data model with overwrite flag set to true.`
        );
      }

      // Store the data model (clone if not mutable)
      const newDataModels = new Map(state.dataModels);
      newDataModels.set(
        dataModelId,
        isMutable ? dataModel : _.cloneDeep(dataModel)
      );

      set({ dataModels: newDataModels });

      // Notify changes
      state._notifyChanges({
        store: newDataModels,
        patch: {
          patchId: generateUid(),
          storeId: dataModelId,
          firstChange: true,
          timestamp: Date.now(),
          operation: StoreActionEnum.register,
          innerAction: false,
        },
      });
    },

    // Deregister a data model
    deregisterDataModel: (dataModelId: string) => {
      if (!dataModelId) {
        throw new Error('Data Models Manager Error: Invalid data model ID!');
      }

      const state = get();
      const newDataModels = new Map(state.dataModels);
      newDataModels.delete(dataModelId);

      // Remove related patches from history
      const newStoreChanges = state.storeChanges.filter(
        (patch) => patch.storeId !== dataModelId
      );

      set({
        dataModels: newDataModels,
        storeChanges: newStoreChanges,
      });
    },

    // Check if data model exists
    has: (dataModelId: string): boolean => {
      return get().dataModels.has(dataModelId);
    },

    // Check if path exists in data model
    hasIn: (dataModelId: string, path: Segments): boolean => {
      const state = get();
      if (state.dataModels.has(dataModelId)) {
        return _.has(state.dataModels.get(dataModelId), path);
      }
      return false;
    },

    // Get data model by ID
    getById: (dataModelId: string): any => {
      return get().dataModels.get(dataModelId);
    },

    // Get value at path in data model
    getIn: (dataModelId: string, path: Segments): any => {
      const dataModel = get().dataModels.get(dataModelId);
      return _.get(dataModel, path);
    },

    // Set value at path in data model
    setIn: (dataModelId: string, path: Segments, value: any): void => {
      const state = get();
      const shouldImmute = state._shouldImmute(dataModelId, path, value);

      if (shouldImmute === undefined) return;

      const immuteRoot = state._immuteRoot(dataModelId);
      const setWithCustomizer = (val: any) => _.clone(val);
      const updatedModel = _.setWith(immuteRoot, path, value, setWithCustomizer);

      const newDataModels = new Map(state.dataModels);
      newDataModels.set(dataModelId, updatedModel);

      set({ dataModels: newDataModels });

      state._notifyChanges({
        store: newDataModels,
        patch: {
          patchId: generateUid(),
          storeId: dataModelId,
          firstChange: false,
          timestamp: Date.now(),
          patchedPath: Array.isArray(path) ? path.join('.') : path,
          patchedSegments: Array.isArray(path) ? path : [path],
          patchedValue: value,
          previousValue: shouldImmute,
          operation: StoreActionEnum.edit,
          innerAction: false,
        },
      });
    },

    // Extend data model with new value
    extend: (
      storeId: string,
      path: Segments,
      value: any,
      overwrite: boolean = false
    ): void => {
      const state = get();
      const existingValue = state.getIn(storeId, path);

      const immuteRoot = state._immuteRoot(storeId);
      const setWithCustomizer = (val: any) => _.clone(val);
      const updatedModel = _.setWith(immuteRoot, path, value, setWithCustomizer);

      const newDataModels = new Map(state.dataModels);
      newDataModels.set(storeId, updatedModel);

      set({ dataModels: newDataModels });

      state._notifyChanges({
        store: newDataModels,
        patch: {
          patchId: generateUid(),
          storeId: storeId,
          firstChange: false,
          timestamp: Date.now(),
          patchedPath: Array.isArray(path) ? path.join('.') : path,
          patchedSegments: Array.isArray(path) ? path : [path],
          patchedValue: value,
          previousValue: existingValue,
          operation: StoreActionEnum.extend,
          innerAction: false,
        },
      });
    },

    // Apply a patch (undo/redo)
    applyPatch: (patchId: string): void => {
      const state = get();
      const patch = state.storeChanges.find((p) => p.patchId === patchId);

      if (!patch) {
        throw new Error(
          `Data Models Manager Error: Could not locate a config patch for the given Id: '${patchId}'`
        );
      }

      if (patch.patchedSegments) {
        state.setIn(patch.storeId, patch.patchedSegments, patch.previousValue);
      }
    },

    // Get all store changes
    getStoreChanges: (): IStorePatch[] => {
      return get().storeChanges;
    },

    // Clear change history
    clearHistory: (): void => {
      set({ storeChanges: [] });
    },

    // Internal: Notify changes
    _notifyChanges: (change: IStoreChange): void => {
      set({ lastChange: change });

      if (!change.patch.firstChange) {
        set((state) => ({
          storeChanges: [...state.storeChanges, change.patch],
        }));
      }

      // console.log('Data Models Manager Change ->', change, get().storeChanges);
    },

    // Internal: Clone root for immutability
    _immuteRoot: (dataModelId: string): any => {
      const dataModel = get().dataModels.get(dataModelId);
      return _.clone(dataModel);
    },

    // Internal: Check if should immute
    _shouldImmute: (
      storeId: string,
      path: Segments,
      newValue: any
    ): any | undefined => {
      const state = get();
      const currentValue = state.getIn(storeId, path);

      if (typeof newValue === 'object' || Array.isArray(newValue)) {
        return _.cloneDeep(currentValue);
      }

      return currentValue !== newValue ? _.cloneDeep(currentValue) : undefined;
    },
  }))
);

/**
 * Hook to subscribe to data model changes
 *
 * @param callback Function to call when changes occur
 * @returns Unsubscribe function
 */
export function subscribeToDataModelChanges(
  callback: IDataModelSubscriber
): () => void {
  return useDataModelManager.subscribe(
    (state) => state.lastChange,
    (change) => {
      if (change) {
        callback(change);
      }
    }
  );
}

/**
 * Hook to subscribe to specific data model changes
 *
 * @param dataModelId The data model ID to watch
 * @param callback Function to call when this specific model changes
 * @returns Unsubscribe function
 */
export function subscribeToDataModel(
  dataModelId: string,
  callback: (dataModel: any, patch: IStorePatch) => void
): () => void {
  return useDataModelManager.subscribe(
    (state) => state.lastChange,
    (change) => {
      if (change && change.patch.storeId === dataModelId) {
        const dataModel = useDataModelManager
          .getState()
          .dataModels.get(dataModelId);
        callback(dataModel, change.patch);
      }
    }
  );
}

/**
 * Standalone Data Model Manager (non-hook version for use in services)
 */
export class DataModelManager {
  private static get state() {
    return useDataModelManager.getState();
  }

  static registerDataModel(
    dataModelId: string,
    dataModel: any,
    overwrite?: boolean,
    isMutable?: boolean
  ): void {
    this.state.registerDataModel(dataModelId, dataModel, overwrite, isMutable);
  }

  static deregisterDataModel(dataModelId: string): void {
    this.state.deregisterDataModel(dataModelId);
  }

  static has(dataModelId: string): boolean {
    return this.state.has(dataModelId);
  }

  static hasIn(dataModelId: string, path: Segments): boolean {
    return this.state.hasIn(dataModelId, path);
  }

  static getById(dataModelId: string): any {
    return this.state.getById(dataModelId);
  }

  static getIn(dataModelId: string, path: Segments): any {
    return this.state.getIn(dataModelId, path);
  }

  static setIn(dataModelId: string, path: Segments, value: any): void {
    this.state.setIn(dataModelId, path, value);
  }

  static extend(
    storeId: string,
    path: Segments,
    value: any,
    overwrite?: boolean
  ): void {
    this.state.extend(storeId, path, value, overwrite);
  }

  static applyPatch(patchId: string): void {
    this.state.applyPatch(patchId);
  }

  static getStoreChanges(): IStorePatch[] {
    return this.state.getStoreChanges();
  }

  static clearHistory(): void {
    this.state.clearHistory();
  }

  static subscribe(callback: IDataModelSubscriber): () => void {
    return subscribeToDataModelChanges(callback);
  }

  static subscribeToModel(
    dataModelId: string,
    callback: (dataModel: any, patch: IStorePatch) => void
  ): () => void {
    return subscribeToDataModel(dataModelId, callback);
  }
}

export default DataModelManager;

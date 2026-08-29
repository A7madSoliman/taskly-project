/**
 * Safety contracts and types for disposable test fixtures.
 *
 * PHASE A CONTRACT:
 * - Zero backend write mutations (POST TABLE: 0, PATCH: 0, DELETE: 0, RPC WRITE: 0, DDL: 0).
 * - Exact-ID cleanup safety contracts defined for subsequent regression phases.
 * - NO broad prefix deletion or unindexed cleanup functions.
 */

export interface DisposableEntityRef {
  readonly id: string;
  readonly entityType: "project" | "epic" | "task";
  readonly createdAt: number;
}

export interface ExactIdCleanupRegistry {
  register(entity: DisposableEntityRef): void;
  getTrackedEntities(): readonly DisposableEntityRef[];
}

/**
 * Placeholder exact-ID safety registry instance for Phase A foundation.
 * Phase A performs 0 creates and 0 deletes.
 */
export const disposableSafetyRegistry: ExactIdCleanupRegistry = {
  register: () => {
    // Phase A no-op
  },
  getTrackedEntities: () => [],
};

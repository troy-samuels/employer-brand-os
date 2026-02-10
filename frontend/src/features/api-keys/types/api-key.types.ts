/**
 * @module features/api-keys/types/api-key.types
 * Module implementation for api-key.types.ts.
 */

/**
 * API Key Management Types
 * Type definitions for Rankwell API key generation and management
 */

export interface ApiKeyRecord {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  keyVersion: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  graceExpiresAt: string | null;
}

/**
 * Defines the GenerateKeyResult contract.
 */
export interface GenerateKeyResult {
  success: boolean;
  error?: string;
  /** The raw API key - only returned once at creation time */
  rawKey?: string;
  /** The key prefix for display (e.g., pk_live_abc1...) */
  keyPrefix?: string;
  /** The key ID in the database */
  keyId?: string;
}

/**
 * Defines the GetApiKeyResult contract.
 */
export interface GetApiKeyResult {
  success: boolean;
  error?: string;
  /** Whether an active key exists */
  hasKey: boolean;
  /** The key prefix for display (masked) */
  keyPrefix?: string;
  /** Key metadata */
  key?: ApiKeyRecord;
}

/**
 * Defines the RevokeKeyResult contract.
 */
export interface RevokeKeyResult {
  success: boolean;
  error?: string;
}

/**
 * Defines the ApiKeyScope contract.
 */
export type ApiKeyScope =
  | 'pixel:read'
  | 'pixel:write'
  | 'facts:read'
  | 'facts:write';

/**
 * Exposes exported value(s): DEFAULT_SCOPES.
 */
export const DEFAULT_SCOPES: ApiKeyScope[] = ['pixel:read', 'facts:read'];

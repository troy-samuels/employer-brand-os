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
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

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

export interface RevokeKeyResult {
  success: boolean;
  error?: string;
}

export type ApiKeyScope =
  | 'pixel:read'
  | 'pixel:write'
  | 'facts:read'
  | 'facts:write';

export const DEFAULT_SCOPES: ApiKeyScope[] = ['pixel:read', 'facts:read'];

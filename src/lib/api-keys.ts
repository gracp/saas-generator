/**
 * API Keys Management
 * Simple in-memory store (will migrate to DB later)
 */

export interface ApiKey {
  id: string;
  name: string;
  key: string; // stored but never returned fully after creation
  maskedKey: string; // sk_live_****xxxx format
  createdAt: Date;
  lastUsed: Date | null;
}

// In-memory store: userId -> ApiKey[]
// In production, this would be a database
const apiKeysStore = new Map<string, ApiKey[]>();

function generateKeyId(): string {
  return `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateApiKey(): string {
  const prefix = 'sk_live';
  const randomPart = Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join(
    ''
  );
  return `${prefix}_${randomPart}`;
}

function maskKey(key: string): string {
  if (key.length <= 8) return key;
  const prefix = key.substring(0, 7); // sk_live
  const last4 = key.substring(key.length - 4);
  return `${prefix}****${last4}`;
}

/**
 * Create a new API key for a user
 * Returns the full key only once - it cannot be retrieved again
 */
export function createApiKey(userId: string, name: string): { id: string; key: string } {
  const userKeys = apiKeysStore.get(userId) || [];

  const fullKey = generateApiKey();
  const maskedKey = maskKey(fullKey);

  const newKey: ApiKey = {
    id: generateKeyId(),
    name,
    key: fullKey, // stored for validation
    maskedKey,
    createdAt: new Date(),
    lastUsed: null,
  };

  userKeys.push(newKey);
  apiKeysStore.set(userId, userKeys);

  return { id: newKey.id, key: fullKey };
}

/**
 * Get all API keys for a user (masked)
 */
export function getApiKeys(userId: string): Omit<ApiKey, 'key'>[] {
  const userKeys = apiKeysStore.get(userId) || [];
  return userKeys.map(({ key, ...rest }) => ({
    ...rest,
    maskedKey: maskKey(key),
  }));
}

/**
 * Revoke (delete) an API key for a user
 */
export function revokeApiKey(userId: string, keyId: string): boolean {
  const userKeys = apiKeysStore.get(userId) || [];
  const index = userKeys.findIndex((k) => k.id === keyId);

  if (index === -1) return false;

  userKeys.splice(index, 1);
  apiKeysStore.set(userId, userKeys);
  return true;
}

/**
 * Validate an API key and return the userId if valid
 */
export function validateApiKey(key: string): { valid: boolean; userId?: string } {
  apiKeysStore.forEach((keys, userId) => {
    const found = keys.find((k) => k.key === key);
    if (found) {
      found.lastUsed = new Date();
      // Found but need to return early — use a flag
    }
  });
  // Simplified: iterate with forEach and use a result variable
  let result: { valid: boolean; userId?: string } = { valid: false };
  apiKeysStore.forEach((keys, userId) => {
    if (result.valid) return;
    const found = keys.find((k) => k.key === key);
    if (found) {
      found.lastUsed = new Date();
      result = { valid: true, userId };
    }
  });
  return result;
}

/**
 * Update last used timestamp for a key
 */
export function touchApiKey(userId: string, keyId: string): void {
  const userKeys = apiKeysStore.get(userId) || [];
  const key = userKeys.find((k) => k.id === keyId);
  if (key) {
    key.lastUsed = new Date();
  }
}

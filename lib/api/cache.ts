class LRUCache<T> {
  private cache: Map<string, { value: T; expiry: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 200, ttl = 3600000) {
    this.cache = new Map<string, { value: T; expiry: number }>();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, { value, expiry: Date.now() + this.ttl });

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (typeof oldestKey === 'string') {
        this.cache.delete(oldestKey);
      }
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new LRUCache(500);

export { LRUCache };

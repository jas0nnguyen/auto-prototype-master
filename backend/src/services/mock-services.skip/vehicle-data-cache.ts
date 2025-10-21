/**
 * Vehicle Data Cache Service (T056b)
 *
 * Implements an in-memory cache for vehicle data with 24-hour TTL and cache-aside pattern.
 * Reduces load on external VIN decoder and valuation services.
 *
 * ANALOGY: Like a coffee shop keeping popular drinks ready instead of making each one from scratch.
 * - Cache Hit = Grab pre-made drink from warmer (fast!)
 * - Cache Miss = Make fresh drink, put extra in warmer for next customer (slower first time)
 * - TTL = Throw away drinks after 24 hours to ensure freshness
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Cache Entry Structure
 * Stores the cached data along with when it was created
 */
interface CacheEntry<T> {
  data: T;                    // The actual cached data
  timestamp: number;          // When this was cached (milliseconds since epoch)
  expiresAt: number;          // When this expires (timestamp + TTL)
}

/**
 * Cache Key Patterns (as specified in requirements):
 * - vehicle:vin:{vin}                    // Lookup by VIN
 * - vehicle:mmv:{make}:{model}:{year}    // Lookup by Make/Model/Year
 */
type CacheKey = `vehicle:vin:${string}` | `vehicle:mmv:${string}:${string}:${number}`;

/**
 * Vehicle Data Cache Service
 *
 * Uses the Cache-Aside pattern:
 * 1. Check cache first
 * 2. If cache miss, fetch from source
 * 3. Store result in cache for future requests
 * 4. Return data
 */
@Injectable()
export class VehicleDataCache {
  private readonly logger = new Logger(VehicleDataCache.name);

  /**
   * In-memory cache storage using JavaScript Map
   *
   * Map vs Object:
   * - Map allows any type as key (not just strings)
   * - Map has built-in size property
   * - Map has better performance for frequent additions/deletions
   * - Map maintains insertion order
   */
  private readonly cache = new Map<CacheKey, CacheEntry<any>>();

  /**
   * Time-to-Live: 24 hours in milliseconds
   *
   * Math breakdown:
   * 24 hours × 60 minutes/hour × 60 seconds/minute × 1000 milliseconds/second
   * = 86,400,000 milliseconds
   */
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Maximum cache size (prevents unlimited memory growth)
   * If cache exceeds this, oldest entries are evicted
   */
  private readonly MAX_CACHE_SIZE = 10000;

  constructor() {
    // Start background cleanup job
    this.startCleanupInterval();
  }

  /**
   * Generate cache key for VIN lookup
   *
   * Example: vehicle:vin:1HGBH41JXMN109186
   */
  private getVINKey(vin: string): CacheKey {
    return `vehicle:vin:${vin.toUpperCase()}` as CacheKey;
  }

  /**
   * Generate cache key for Make/Model/Year lookup
   *
   * Example: vehicle:mmv:TOYOTA:CAMRY:2020
   */
  private getMMVKey(make: string, model: string, year: number): CacheKey {
    return `vehicle:mmv:${make.toUpperCase()}:${model.toUpperCase()}:${year}` as CacheKey;
  }

  /**
   * Get data from cache by VIN
   *
   * @param vin - Vehicle Identification Number
   * @returns Cached data or null if not found/expired
   */
  async getByVIN<T>(vin: string): Promise<T | null> {
    const key = this.getVINKey(vin);
    return this.get<T>(key);
  }

  /**
   * Get data from cache by Make/Model/Year
   *
   * @param make - Vehicle make (e.g., "Toyota")
   * @param model - Vehicle model (e.g., "Camry")
   * @param year - Model year (e.g., 2020)
   * @returns Cached data or null if not found/expired
   */
  async getByMMV<T>(make: string, model: string, year: number): Promise<T | null> {
    const key = this.getMMVKey(make, model, year);
    return this.get<T>(key);
  }

  /**
   * Generic get method (private - used internally)
   *
   * Cache-Aside Pattern Step 1: Check cache
   */
  private get<T>(key: CacheKey): T | null {
    const entry = this.cache.get(key);

    // Cache miss - data not in cache
    if (!entry) {
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // Check if entry has expired
    const now = Date.now(); // Current time in milliseconds
    if (now > entry.expiresAt) {
      this.logger.debug(`Cache EXPIRED: ${key} (age: ${(now - entry.timestamp) / 1000}s)`);
      this.cache.delete(key); // Remove expired entry
      return null;
    }

    // Cache hit - return cached data
    this.logger.debug(`Cache HIT: ${key} (age: ${(now - entry.timestamp) / 1000}s)`);
    return entry.data as T;
  }

  /**
   * Store data in cache by VIN
   *
   * @param vin - Vehicle Identification Number
   * @param data - Data to cache
   */
  async setByVIN<T>(vin: string, data: T): Promise<void> {
    const key = this.getVINKey(vin);
    this.set(key, data);
  }

  /**
   * Store data in cache by Make/Model/Year
   *
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param year - Model year
   * @param data - Data to cache
   */
  async setByMMV<T>(make: string, model: string, year: number, data: T): Promise<void> {
    const key = this.getMMVKey(make, model, year);
    this.set(key, data);
  }

  /**
   * Generic set method (private - used internally)
   *
   * Cache-Aside Pattern Step 3: Store result in cache
   */
  private set<T>(key: CacheKey, data: T): void {
    // Check cache size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.TTL_MS,
    };

    this.cache.set(key, entry);
    this.logger.debug(`Cache SET: ${key} (expires in 24h)`);
  }

  /**
   * Evict oldest cache entry when size limit is reached
   *
   * Map maintains insertion order, so first entry is oldest
   * This is called LRU (Least Recently Used) eviction
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.logger.warn(`Cache size limit reached. Evicted oldest entry: ${firstKey}`);
    }
  }

  /**
   * Clear all cache entries
   *
   * Useful for testing or manual cache invalidation
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cache cleared. Removed ${size} entries.`);
  }

  /**
   * Get cache statistics
   *
   * Useful for monitoring cache performance
   */
  getStats() {
    let expiredCount = 0;
    let validCount = 0;
    const now = Date.now();

    // Count expired vs valid entries
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: validCount,
      expiredEntries: expiredCount,
      maxSize: this.MAX_CACHE_SIZE,
      ttlHours: this.TTL_MS / (1000 * 60 * 60),
    };
  }

  /**
   * Start background cleanup interval
   *
   * Runs every hour to remove expired entries and prevent memory leaks
   */
  private startCleanupInterval(): void {
    // Run cleanup every hour
    const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

    setInterval(() => {
      this.cleanupExpired();
    }, CLEANUP_INTERVAL);

    this.logger.log('Cache cleanup interval started (runs every hour)');
  }

  /**
   * Remove all expired entries from cache
   *
   * This prevents memory from growing indefinitely with expired data
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removedCount = 0;

    // Iterate through all cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(`Cleanup removed ${removedCount} expired cache entries`);
    }
  }

  /**
   * Invalidate (remove) specific cache entry by VIN
   *
   * Use when data is known to have changed and cache should be refreshed
   */
  async invalidateByVIN(vin: string): Promise<void> {
    const key = this.getVINKey(vin);
    const existed = this.cache.delete(key);
    if (existed) {
      this.logger.debug(`Cache invalidated: ${key}`);
    }
  }

  /**
   * Invalidate (remove) specific cache entry by Make/Model/Year
   */
  async invalidateByMMV(make: string, model: string, year: number): Promise<void> {
    const key = this.getMMVKey(make, model, year);
    const existed = this.cache.delete(key);
    if (existed) {
      this.logger.debug(`Cache invalidated: ${key}`);
    }
  }
}

/**
 * LEARNING SUMMARY - Key Concepts:
 *
 * 1. **Map Data Structure**:
 *    - Like a dictionary: key → value lookups
 *    - O(1) average lookup time (very fast!)
 *    - Better than Object for dynamic keys
 *
 * 2. **Time-to-Live (TTL)**:
 *    - Data expires after a set time
 *    - Prevents stale data from being served
 *    - Balance between cache hits and data freshness
 *
 * 3. **Cache-Aside Pattern**:
 *    - Application manages cache (not database)
 *    - Steps: Check cache → If miss, fetch source → Store in cache → Return
 *    - Most common caching pattern
 *
 * 4. **Memory Management**:
 *    - Limit cache size to prevent out-of-memory errors
 *    - Evict oldest entries when limit reached
 *    - Background cleanup removes expired entries
 *
 * 5. **Generics in TypeScript** (`<T>`):
 *    - `async getByVIN<T>` means "T can be any type"
 *    - Caller decides: `getByVIN<VehicleData>(vin)`
 *    - Provides type safety while remaining flexible
 *
 * PRODUCTION CONSIDERATIONS:
 * - In production, use Redis or Memcached (distributed cache)
 * - In-memory cache doesn't survive server restarts
 * - Multiple servers don't share in-memory cache (each has its own)
 * - Redis provides: persistence, pub/sub, cluster mode, better eviction policies
 */

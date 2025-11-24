/**
 * Rate Limiter for Trello API
 * Handles rate limiting according to Trello API limits:
 * - 100 requests per 10 seconds per token
 * - 300 requests per 10 seconds per API key
 * We use the more restrictive token limit (100 req/10s)
 */

import { createChildLogger } from '../logger.js';

const logger = createChildLogger({ module: 'RateLimiter' });

export class RateLimiter {
  private requestsInWindow: number = 0;
  private windowStart: number = Date.now();
  private readonly maxRequests: number;
  private readonly windowMs: number = 10000; // 10 seconds

  /**
   * Create a new rate limiter
   * @param maxRequests - Maximum requests per window (default: 100 for Trello token limit)
   */
  constructor(maxRequests: number = 100) {
    this.maxRequests = maxRequests;
    logger.info({ maxRequests, windowMs: this.windowMs }, 'RateLimiter initialized');
  }

  /**
   * Execute a function with rate limiting
   * Waits if necessary to respect rate limits
   */
  async executeWithLimit<T>(fn: () => Promise<T>): Promise<T> {
    // Reset window if expired
    const now = Date.now();
    if (now - this.windowStart > this.windowMs) {
      logger.debug(
        {
          previousRequests: this.requestsInWindow,
          windowDuration: now - this.windowStart
        },
        'Resetting rate limit window'
      );
      this.requestsInWindow = 0;
      this.windowStart = now;
    }

    // Wait if limit reached
    if (this.requestsInWindow >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.windowStart);
      logger.warn(
        {
          requestsInWindow: this.requestsInWindow,
          maxRequests: this.maxRequests,
          waitTimeMs: waitTime
        },
        'Rate limit reached, waiting...'
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime + 100)); // +100ms safety margin

      this.requestsInWindow = 0;
      this.windowStart = Date.now();
    }

    this.requestsInWindow++;
    logger.debug(
      {
        requestsInWindow: this.requestsInWindow,
        maxRequests: this.maxRequests
      },
      'Executing request'
    );

    return fn();
  }

  /**
   * Execute multiple operations in batches with rate limiting
   * @param operations - Array of operations to execute
   * @param batchSize - Number of operations per batch (default: 80)
   * @param delayBetweenBatchesMs - Delay between batches in ms (default: 2000)
   */
  async executeBatch<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 80,
    delayBetweenBatchesMs: number = 2000
  ): Promise<T[]> {
    const results: T[] = [];
    const totalBatches = Math.ceil(operations.length / batchSize);

    logger.info(
      {
        totalOperations: operations.length,
        batchSize,
        totalBatches,
        delayBetweenBatchesMs
      },
      'Starting batch execution'
    );

    for (let i = 0; i < operations.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = operations.slice(i, i + batchSize);

      logger.info(
        {
          batchNumber,
          totalBatches,
          batchOperations: batch.length
        },
        'Executing batch'
      );

      // Execute batch in parallel with rate limiting
      const batchResults = await Promise.all(batch.map((op) => this.executeWithLimit(op)));

      results.push(...batchResults);

      // Delay between batches (except for last batch)
      if (i + batchSize < operations.length) {
        logger.debug({ delayMs: delayBetweenBatchesMs }, 'Delaying between batches');
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatchesMs));
      }
    }

    logger.info(
      {
        totalOperations: operations.length,
        totalResults: results.length
      },
      'Batch execution completed'
    );

    return results;
  }

  /**
   * Get current rate limit stats
   */
  getStats(): {
    requestsInWindow: number;
    maxRequests: number;
    remainingRequests: number;
    windowElapsedMs: number;
    windowMs: number;
  } {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    return {
      requestsInWindow: this.requestsInWindow,
      maxRequests: this.maxRequests,
      remainingRequests: Math.max(0, this.maxRequests - this.requestsInWindow),
      windowElapsedMs: elapsed,
      windowMs: this.windowMs
    };
  }
}

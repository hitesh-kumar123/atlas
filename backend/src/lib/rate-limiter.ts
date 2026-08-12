interface BucketState {
  tokens: number;
  lastRefillMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remainingTokens?: number;
}

export class TokenBucketRateLimiter {
  private buckets = new Map<string, BucketState>();
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;

  constructor(capacity = 200, refillRatePerSecond = 200) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  public consume(key: string, tokensRequested = 1): RateLimitResult {
    const now = Date.now();
    let state = this.buckets.get(key);

    if (!state) {
      state = {
        tokens: this.capacity,
        lastRefillMs: now,
      };
      this.buckets.set(key, state);
    } else {
      const elapsedMs = now - state.lastRefillMs;
      const refilled = (elapsedMs / 1000) * this.refillRatePerSecond;
      state.tokens = Math.min(this.capacity, state.tokens + refilled);
      state.lastRefillMs = now;
    }

    if (state.tokens >= tokensRequested) {
      state.tokens -= tokensRequested;
      return {
        allowed: true,
        remainingTokens: Math.floor(state.tokens),
      };
    } else {
      const tokensNeeded = tokensRequested - state.tokens;
      const waitSeconds = Math.ceil(tokensNeeded / this.refillRatePerSecond);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, waitSeconds),
        remainingTokens: Math.floor(state.tokens),
      };
    }
  }

  public cleanupStaleBuckets(maxAgeMs = 3600_000) {
    const now = Date.now();
    for (const [key, state] of this.buckets.entries()) {
      if (now - state.lastRefillMs > maxAgeMs) {
        this.buckets.delete(key);
      }
    }
  }
}

export const globalRateLimiter = new TokenBucketRateLimiter(200, 200);

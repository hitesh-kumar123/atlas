# ADR-005: Ingestion Rate Limiting via Token Bucket

## Status
Accepted

## Context
High-volume event ingestion endpoints (`POST /api/v1/events`) require rate limiting to prevent noisy neighbors or malicious actors from exhausting database connection pools and CPU resources. The rate limiter needs to enforce per-API-key throughput limits and respond with standard HTTP `429 Too Many Requests` and `Retry-After` headers.

## Decision
Implement a sliding Token Bucket rate limiter (`TokenBucketRateLimiter` in `src/lib/rate-limiter.ts`) configured with a default capacity of 200 tokens (events) and a refill rate of 200 tokens/second per API key.

## Options Considered
- **Postgres Table Rate Limiter**: Transactional overhead per ingest request adds latency to the hot path (every POST request writes to a rate limit tracking table).
- **Redis / Upstash Rate Limiter**: Centralized state, ideal for multi-node clusters, but introduces external infrastructure dependency for single-node local dev setups.
- **In-Memory Token Bucket per Process (Chosen)**: Sub-millisecond performance on the ingest path with zero database I/O overhead.

## Consequences & Known Limitations
- **Multi-Instance Limitation**: The current rate limiter state is stored in-memory per Node.js process. In a distributed multi-instance deployment (e.g. serverless functions or container autoscaling), the effective rate limit multiplies across instances.
- **Upgrade Path**: In production multi-node clusters, the token bucket state can be swapped to Upstash Redis with zero changes to the `POST /api/v1/events` handler interface.

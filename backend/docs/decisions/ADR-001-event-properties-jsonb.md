# ADR-001: Event properties as JSONB, not a normalized EventProperty table

## Status
Accepted

## Context
Each `Event` needs an open set of custom properties defined by the
customer's own app (`{ plan: "pro", price: 29 }` for one tenant,
`{ device: "ios", version: "4.2" }` for another). We need to choose
between a `properties Json` column on `Event`, or a normalized
`EventProperty(eventId, key, value)` table.

## Decision
Store properties as a `Json` (JSONB) column on `Event`, with a GIN index
for property-based filtering.

## Options considered
- **Normalized EventProperty table**: fully typed, easy to index individual
  keys, but requires a join on every query that touches properties — and
  funnel/retention/property-filter queries are exactly the ones with a
  300ms budget at 10M+ rows. Also requires a schema migration mentality
  for what is, by definition, arbitrary per-tenant data.
- **JSONB column (chosen)**: no join, properties travel with the row,
  GIN index (`jsonb_path_ops`) supports `properties @> '{"plan":"pro"}'`
  style filters reasonably well. Loses SQL-level type constraints on
  individual properties.

## Consequences
- Property validation moves to the application layer: Zod schemas at
  ingest are the only thing keeping garbage out, not a DB constraint.
- Property-based funnel/segment filters use JSONB operators, not joins —
  revisit if query plans show sequential scans instead of the GIN index
  being used (see `docs/perf/`).
- If this stops scaling, materialized views over commonly-filtered
  properties is the escape hatch, not a wholesale move to EAV.

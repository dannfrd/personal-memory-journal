-- ==============================================================================
-- Database Optimization & Index Migration for Lovelog (PostgreSQL)
-- Specs Covered: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06
-- Safe to run multiple times (idempotent IF NOT EXISTS)
-- ==============================================================================

-- 1. Index on posts.memory_date DESC (Used by GET /memories main feed ordering)
CREATE INDEX IF NOT EXISTS "posts_memory_date_idx" ON "posts" ("memory_date" DESC);

-- 2. Index on posts.created_at DESC (Used for chronological admin sorting)
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" ("created_at" DESC);

-- 3. Composite index on post_images (post_id, sort_order) (Eliminates sort scan on gallery relations)
CREATE INDEX IF NOT EXISTS "post_images_post_id_sort_order_idx" ON "post_images" ("post_id", "sort_order" ASC);

-- 4. Index on likes.post_id (Speeds up _count.likes aggregation per memory)
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "likes" ("post_id");

-- 5. Composite index on comments (post_id, created_at) (Speeds up GET /memories/:id/comments & _count.comments)
CREATE INDEX IF NOT EXISTS "comments_post_id_created_at_idx" ON "comments" ("post_id", "created_at" ASC);

-- 6. Index on comments.parent_id (Speeds up threaded reply lookups and cascade deletes)
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments" ("parent_id");

-- 7. Index on comments.created_at DESC (Speeds up GET /admin/comments)
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments" ("created_at" DESC);

-- 8. Update planner statistics immediately (DB-06)
ANALYZE "posts";
ANALYZE "post_images";
ANALYZE "likes";
ANALYZE "comments";

-- ==============================================================================
-- DB-04: Audit Table Sizes & Index Usage Query (Run in psql for reporting)
-- ==============================================================================
-- SELECT
--   relname AS table_name,
--   pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
--   pg_size_pretty(pg_relation_size(relid)) AS data_size,
--   pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
-- FROM pg_catalog.pg_statio_user_tables
-- ORDER BY pg_total_relation_size(relid) DESC;

-- ==============================================================================
-- DB-05: Recommended PostgreSQL Tuning for 2 vCPU / 4 GB RAM VPS
-- (Co-located with Next.js + Node API + Nginx; targets ~700 MB max PG RAM)
-- Place in /etc/postgresql/<version>/main/conf.d/lovelog-tuning.conf
-- ==============================================================================
-- max_connections = 40
-- shared_buffers = 512MB
-- effective_cache_size = 1536MB
-- maintenance_work_mem = 64MB
-- work_mem = 8MB
-- random_page_cost = 1.1
-- effective_io_concurrency = 200
-- wal_buffers = 16MB
-- min_wal_size = 256MB
-- max_wal_size = 1GB
-- checkpoint_completion_target = 0.9

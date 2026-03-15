-- CreateIndex
CREATE INDEX IF NOT EXISTS "loans_createdAt_idx" ON "loans"("createdAt");

-- CreateIndex (Composite index for filtering by status and sorting by createdAt)
CREATE INDEX IF NOT EXISTS "loans_status_createdAt_idx" ON "loans"("status", "createdAt");

-- Normalize legacy loan rates stored as human percentages.
-- Loans now persist percentage rates as decimal fractions:
-- 1% => 0.0100, 2.5% => 0.0250
UPDATE "loans"
SET "interestRate" = ROUND("interestRate" / 100.0, 4)
WHERE "interestType" IN ('PERCENTAGE_MONTHLY', 'PERCENTAGE_ANNUAL')
  AND "interestRate" >= 1;

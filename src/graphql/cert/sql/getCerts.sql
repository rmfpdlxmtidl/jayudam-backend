/* @name getCerts */
SELECT id,
  birthdate,
  content,
  effective_date,
  issue_date,
  name,
  sex,
  "type"
FROM cert
WHERE user_id = $1
  AND "type" = ANY ($2)
  AND (
    (
      "type" = 0
      OR "type" = 1
    )
    AND effective_date > $3
    OR "type" = 2
    AND effective_date > $4
    OR "type" = 3
    AND effective_date > $5
  );
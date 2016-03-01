
# Keep every 10th row
WITH temp AS (
  SELECT *, row_number() OVER(ORDER BY id ASC) AS row
  FROM measurements
  WHERE sensor_id = 'moist_2'
)
DELETE FROM measurements WHERE id IN (
  SELECT id FROM temp
  WHERE row % 10 != 0
);

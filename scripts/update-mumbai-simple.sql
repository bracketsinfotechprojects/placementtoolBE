-- ============================================
-- Simple Mumbai Location Update
-- ============================================
-- Updates students and facilities with random Mumbai coordinates
-- Mumbai: Latitude 18.90 to 19.30, Longitude 72.75 to 72.95

-- Update all students with random Mumbai locations
UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Longitude: 72.75 to 72.95
    18.90 + (RAND() * 0.40)   -- Latitude: 18.90 to 19.30
)
WHERE isDeleted = 0;

-- Update all facilities with random Mumbai locations
UPDATE facility 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Longitude: 72.75 to 72.95
    18.90 + (RAND() * 0.40)   -- Latitude: 18.90 to 19.30
)
WHERE isDeleted = 0;

-- Verify updates
SELECT 'Students updated:' as info, COUNT(*) as count 
FROM students 
WHERE isDeleted = 0 
  AND ST_X(location) BETWEEN 72.75 AND 72.95;

SELECT 'Facilities updated:' as info, COUNT(*) as count 
FROM facility 
WHERE isDeleted = 0 
  AND ST_X(location) BETWEEN 72.75 AND 72.95;

-- Show sample data
SELECT student_id, first_name, last_name, 
       ROUND(ST_Y(location), 4) as lat, 
       ROUND(ST_X(location), 4) as lng
FROM students WHERE isDeleted = 0 LIMIT 5;

SELECT facility_id, organization_name, 
       ROUND(ST_Y(location), 4) as lat, 
       ROUND(ST_X(location), 4) as lng
FROM facility WHERE isDeleted = 0 LIMIT 5;

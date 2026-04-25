-- ============================================
-- Random Location Update for Facilities - Mumbai Area
-- ============================================
-- This script updates facility locations with random coordinates within Mumbai
-- Mumbai boundaries: Latitude 18.90 to 19.30, Longitude 72.75 to 72.95

-- ============================================
-- METHOD 1: Update All Facilities with Random Mumbai Locations
-- ============================================

-- Update facilities with random locations in Mumbai
UPDATE facility 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Random longitude between 72.75 and 72.95
    18.90 + (RAND() * 0.40)   -- Random latitude between 18.90 and 19.30
)
WHERE isDeleted = 0;

-- ============================================
-- METHOD 2: Update with Predefined Mumbai Locations (Recommended)
-- ============================================

-- Create temporary table with healthcare facility locations in Mumbai
CREATE TEMPORARY TABLE IF NOT EXISTS mumbai_facility_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Insert realistic healthcare facility locations across Mumbai
INSERT INTO mumbai_facility_locations (area_name, latitude, longitude) VALUES
-- South Mumbai
('Colaba Medical Center', 18.9067, 72.8147),
('Fort Healthcare', 18.9322, 72.8347),
('Marine Drive Clinic', 18.9432, 72.8236),
('Churchgate Care', 18.9320, 72.8258),
-- Central Mumbai
('Dadar Care Center', 19.0176, 72.8479),
('Parel Medical Hub', 18.9989, 72.8302),
('Worli Healthcare', 19.0176, 72.8133),
('Matunga Clinic', 19.0270, 72.8570),
-- Western Suburbs
('Bandra Medical Center', 19.0596, 72.8295),
('Khar Healthcare', 19.0728, 72.8347),
('Santacruz Clinic', 19.0825, 72.8417),
('Vile Parle Care', 19.1045, 72.8470),
('Andheri Medical Hub', 19.1136, 72.8697),
('Juhu Healthcare', 19.0990, 72.8265),
('Goregaon Care Center', 19.1663, 72.8526),
('Malad Medical Center', 19.1864, 72.8493),
('Kandivali Healthcare', 19.2074, 72.8479),
('Borivali Care Hub', 19.2403, 72.8565),
-- Eastern Suburbs
('Kurla Medical Center', 19.0728, 72.8826),
('Ghatkopar Healthcare', 19.0860, 72.9081),
('Vikhroli Care Center', 19.1076, 72.9252),
('Mulund Medical Hub', 19.1722, 72.9565),
('Powai Healthcare', 19.1176, 72.9060),
('Chembur Care Center', 19.0633, 72.8997),
-- Extended Areas
('Thane Medical Center', 19.2183, 72.9781),
('Navi Mumbai Healthcare', 19.0330, 73.0297),
('Vashi Care Hub', 19.0768, 73.0004),
('Airoli Medical Center', 19.1522, 72.9989);

-- Update facilities with locations from the list (with slight variation for realism)
UPDATE facility f
SET location = (
    SELECT POINT(
        ml.longitude + (RAND() * 0.01 - 0.005),  -- Add ±0.005 degree variation
        ml.latitude + (RAND() * 0.01 - 0.005)
    )
    FROM mumbai_facility_locations ml
    ORDER BY RAND()
    LIMIT 1
)
WHERE f.isDeleted = 0;

-- Clean up
DROP TEMPORARY TABLE IF EXISTS mumbai_facility_locations;

-- ============================================
-- METHOD 3: Update Facilities by Area (Distributed)
-- ============================================

-- South Mumbai facilities
UPDATE facility 
SET location = POINT(
    72.81 + (RAND() * 0.04),
    18.90 + (RAND() * 0.05)
)
WHERE facility_id % 4 = 0 
  AND isDeleted = 0;

-- Central Mumbai facilities
UPDATE facility 
SET location = POINT(
    72.81 + (RAND() * 0.04),
    19.00 + (RAND() * 0.05)
)
WHERE facility_id % 4 = 1 
  AND isDeleted = 0;

-- Western Suburbs facilities
UPDATE facility 
SET location = POINT(
    72.82 + (RAND() * 0.04),
    19.10 + (RAND() * 0.10)
)
WHERE facility_id % 4 = 2 
  AND isDeleted = 0;

-- Eastern Suburbs facilities
UPDATE facility 
SET location = POINT(
    72.88 + (RAND() * 0.07),
    19.05 + (RAND() * 0.15)
)
WHERE facility_id % 4 = 3 
  AND isDeleted = 0;

-- ============================================
-- METHOD 4: Update Only Facilities Without Location
-- ============================================

-- Update only facilities with default location (0,0)
UPDATE facility 
SET location = POINT(
    72.75 + (RAND() * 0.20),
    18.90 + (RAND() * 0.40)
)
WHERE isDeleted = 0 
  AND (ST_X(location) = 0 AND ST_Y(location) = 0);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check updated facility locations
SELECT 
    facility_id,
    organization_name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 THEN 'Mumbai'
        ELSE 'Outside Mumbai'
    END as location_status
FROM facility
WHERE isDeleted = 0
ORDER BY facility_id
LIMIT 50;

-- Count facilities by location status
SELECT 
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 THEN 'Mumbai'
        ELSE 'Outside Mumbai'
    END as location_status,
    COUNT(*) as count
FROM facility
WHERE isDeleted = 0
GROUP BY location_status;

-- Show distribution of facilities across Mumbai
SELECT 
    CASE 
        WHEN ST_Y(location) BETWEEN 18.90 AND 19.00 THEN 'South Mumbai'
        WHEN ST_Y(location) BETWEEN 19.00 AND 19.10 THEN 'Central Mumbai'
        WHEN ST_Y(location) BETWEEN 19.10 AND 19.20 THEN 'North Mumbai'
        WHEN ST_Y(location) BETWEEN 19.20 AND 19.30 THEN 'Extended Suburbs'
        ELSE 'Other'
    END as area,
    COUNT(*) as facility_count
FROM facility
WHERE isDeleted = 0
  AND ST_X(location) BETWEEN 72.75 AND 72.95
GROUP BY area
ORDER BY facility_count DESC;

-- Show facilities with their locations
SELECT 
    facility_id,
    organization_name,
    CONCAT(
        ROUND(ST_Y(location), 4), ', ', 
        ROUND(ST_X(location), 4)
    ) as coordinates,
    CASE 
        WHEN ST_Y(location) BETWEEN 18.90 AND 19.00 THEN 'South Mumbai'
        WHEN ST_Y(location) BETWEEN 19.00 AND 19.10 THEN 'Central Mumbai'
        WHEN ST_Y(location) BETWEEN 19.10 AND 19.20 THEN 'North Mumbai'
        WHEN ST_Y(location) BETWEEN 19.20 AND 19.30 THEN 'Extended Suburbs'
    END as area
FROM facility
WHERE isDeleted = 0
  AND ST_X(location) BETWEEN 72.75 AND 72.95
ORDER BY ST_Y(location);

-- ============================================
-- COMBINED UPDATE (Students + Facilities)
-- ============================================

-- Update both students and facilities in one go
-- This ensures good distribution for testing location APIs

-- Facilities
UPDATE facility 
SET location = POINT(
    72.75 + (RAND() * 0.20),
    18.90 + (RAND() * 0.40)
)
WHERE isDeleted = 0;

-- Students
UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),
    18.90 + (RAND() * 0.40)
)
WHERE isDeleted = 0;

-- Verify both
SELECT 
    'Facilities' as entity_type,
    COUNT(*) as total,
    SUM(CASE WHEN ST_X(location) != 0 OR ST_Y(location) != 0 THEN 1 ELSE 0 END) as with_location
FROM facility
WHERE isDeleted = 0
UNION ALL
SELECT 
    'Students' as entity_type,
    COUNT(*) as total,
    SUM(CASE WHEN ST_X(location) != 0 OR ST_Y(location) != 0 THEN 1 ELSE 0 END) as with_location
FROM students
WHERE isDeleted = 0;

-- ============================================
-- TEST LOCATION QUERIES
-- ============================================

-- Find facilities near Gateway of India (18.9220, 72.8347)
SELECT 
    facility_id,
    organization_name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    ROUND(ST_Distance_Sphere(
        location, 
        POINT(72.8347, 18.9220)
    ) / 1000, 2) as distance_km
FROM facility
WHERE isDeleted = 0
  AND ST_Distance_Sphere(location, POINT(72.8347, 18.9220)) <= 5000  -- 5km radius
ORDER BY distance_km
LIMIT 10;

-- Find students near Bandra (19.0596, 72.8295)
SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) as name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    ROUND(ST_Distance_Sphere(
        location, 
        POINT(72.8295, 19.0596)
    ) / 1000, 2) as distance_km
FROM students
WHERE isDeleted = 0
  AND ST_Distance_Sphere(location, POINT(72.8295, 19.0596)) <= 5000  -- 5km radius
ORDER BY distance_km
LIMIT 10;

-- ============================================
-- RECOMMENDED EXECUTION
-- ============================================

/*
STEP 1: Update facilities with realistic locations
Run METHOD 2 for facilities (creates realistic healthcare facility distribution)

STEP 2: Update students with random locations
Run the students script (update-students-mumbai-random.sql) METHOD 4

STEP 3: Verify
Run verification queries to confirm distribution

STEP 4: Test APIs
Use the test queries above to verify location-based searches work correctly
*/

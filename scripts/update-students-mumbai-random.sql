-- ============================================
-- Random Location Update for Students - Mumbai Area
-- ============================================
-- This script updates student locations with random coordinates within Mumbai
-- Mumbai boundaries: Latitude 18.90 to 19.30, Longitude 72.75 to 72.95

-- ============================================
-- METHOD 1: Update All Students with Random Mumbai Locations
-- ============================================

-- Update students with random locations in Mumbai
-- Each student gets a unique random location within Mumbai boundaries
UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),  -- Random longitude between 72.75 and 72.95
    18.90 + (RAND() * 0.40)   -- Random latitude between 18.90 and 19.30
)
WHERE isDeleted = 0;

-- ============================================
-- METHOD 2: Update Specific Students by ID Range
-- ============================================

-- Update students with ID 1 to 100
UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),
    18.90 + (RAND() * 0.40)
)
WHERE student_id BETWEEN 1 AND 100 
  AND isDeleted = 0;

-- ============================================
-- METHOD 3: Update Students with Specific Mumbai Neighborhoods
-- ============================================

-- Distribute students across different Mumbai areas
-- Bandra area (19.05-19.08, 72.82-72.85)
UPDATE students 
SET location = POINT(
    72.82 + (RAND() * 0.03),
    19.05 + (RAND() * 0.03)
)
WHERE student_id % 5 = 0 
  AND isDeleted = 0;

-- Andheri area (19.11-19.14, 72.83-72.86)
UPDATE students 
SET location = POINT(
    72.83 + (RAND() * 0.03),
    19.11 + (RAND() * 0.03)
)
WHERE student_id % 5 = 1 
  AND isDeleted = 0;

-- Powai area (19.11-19.13, 72.89-72.92)
UPDATE students 
SET location = POINT(
    72.89 + (RAND() * 0.03),
    19.11 + (RAND() * 0.02)
)
WHERE student_id % 5 = 2 
  AND isDeleted = 0;

-- Colaba/South Mumbai (18.90-18.93, 72.81-72.84)
UPDATE students 
SET location = POINT(
    72.81 + (RAND() * 0.03),
    18.90 + (RAND() * 0.03)
)
WHERE student_id % 5 = 3 
  AND isDeleted = 0;

-- Thane area (19.18-19.22, 72.96-72.99)
UPDATE students 
SET location = POINT(
    72.96 + (RAND() * 0.03),
    19.18 + (RAND() * 0.04)
)
WHERE student_id % 5 = 4 
  AND isDeleted = 0;

-- ============================================
-- METHOD 4: Update with Predefined Mumbai Locations (More Realistic)
-- ============================================

-- Create a temporary table with specific Mumbai locations
CREATE TEMPORARY TABLE IF NOT EXISTS mumbai_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Insert popular Mumbai locations
INSERT INTO mumbai_locations (area_name, latitude, longitude) VALUES
('Bandra West', 19.0596, 72.8295),
('Andheri East', 19.1136, 72.8697),
('Powai', 19.1176, 72.9060),
('Colaba', 18.9067, 72.8147),
('Dadar', 19.0176, 72.8479),
('Juhu', 19.0990, 72.8265),
('Worli', 19.0176, 72.8133),
('Lower Parel', 18.9989, 72.8302),
('Goregaon', 19.1663, 72.8526),
('Malad', 19.1864, 72.8493),
('Kandivali', 19.2074, 72.8479),
('Borivali', 19.2403, 72.8565),
('Kurla', 19.0728, 72.8826),
('Ghatkopar', 19.0860, 72.9081),
('Mulund', 19.1722, 72.9565),
('Thane', 19.2183, 72.9781),
('Navi Mumbai', 19.0330, 73.0297),
('Vashi', 19.0768, 73.0004),
('Chembur', 19.0633, 72.8997),
('Vikhroli', 19.1076, 72.9252);

-- Update students with random locations from the list (with slight variation)
UPDATE students s
SET location = (
    SELECT POINT(
        ml.longitude + (RAND() * 0.02 - 0.01),  -- Add ±0.01 degree variation
        ml.latitude + (RAND() * 0.02 - 0.01)
    )
    FROM mumbai_locations ml
    ORDER BY RAND()
    LIMIT 1
)
WHERE s.isDeleted = 0;

-- Clean up
DROP TEMPORARY TABLE IF EXISTS mumbai_locations;

-- ============================================
-- METHOD 5: Update Only Students Without Location
-- ============================================

-- Update only students with default location (0,0)
UPDATE students 
SET location = POINT(
    72.75 + (RAND() * 0.20),
    18.90 + (RAND() * 0.40)
)
WHERE isDeleted = 0 
  AND (ST_X(location) = 0 AND ST_Y(location) = 0);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check updated student locations
SELECT 
    student_id,
    CONCAT(first_name, ' ', last_name) as name,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 THEN 'Mumbai'
        ELSE 'Outside Mumbai'
    END as location_status
FROM students
WHERE isDeleted = 0
ORDER BY student_id
LIMIT 50;

-- Count students by location status
SELECT 
    CASE 
        WHEN ST_X(location) = 0 AND ST_Y(location) = 0 THEN 'Not Set'
        WHEN ST_X(location) BETWEEN 72.75 AND 72.95 
         AND ST_Y(location) BETWEEN 18.90 AND 19.30 THEN 'Mumbai'
        ELSE 'Outside Mumbai'
    END as location_status,
    COUNT(*) as count
FROM students
WHERE isDeleted = 0
GROUP BY location_status;

-- Show distribution of students across Mumbai
SELECT 
    CASE 
        WHEN ST_Y(location) BETWEEN 18.90 AND 19.00 THEN 'South Mumbai'
        WHEN ST_Y(location) BETWEEN 19.00 AND 19.10 THEN 'Central Mumbai'
        WHEN ST_Y(location) BETWEEN 19.10 AND 19.20 THEN 'North Mumbai'
        WHEN ST_Y(location) BETWEEN 19.20 AND 19.30 THEN 'Extended Suburbs'
        ELSE 'Other'
    END as area,
    COUNT(*) as student_count
FROM students
WHERE isDeleted = 0
  AND ST_X(location) BETWEEN 72.75 AND 72.95
GROUP BY area
ORDER BY student_count DESC;

-- ============================================
-- MUMBAI AREA REFERENCE
-- ============================================

/*
Mumbai Boundaries:
- Latitude: 18.90 to 19.30 (South to North)
- Longitude: 72.75 to 72.95 (West to East)

Popular Areas with Coordinates:
- Gateway of India: 18.9220, 72.8347
- Bandra: 19.0596, 72.8295
- Andheri: 19.1136, 72.8697
- Powai: 19.1176, 72.9060
- Colaba: 18.9067, 72.8147
- Dadar: 19.0176, 72.8479
- Juhu Beach: 19.0990, 72.8265
- Worli: 19.0176, 72.8133
- Lower Parel: 18.9989, 72.8302
- Goregaon: 19.1663, 72.8526
- Malad: 19.1864, 72.8493
- Borivali: 19.2403, 72.8565
- Kurla: 19.0728, 72.8826
- Ghatkopar: 19.0860, 72.9081
- Thane: 19.2183, 72.9781
- Navi Mumbai: 19.0330, 73.0297

Note: MySQL POINT format is POINT(longitude, latitude)
*/

-- ============================================
-- RECOMMENDED APPROACH
-- ============================================

-- Use METHOD 4 for most realistic distribution
-- It assigns students to actual Mumbai neighborhoods with slight variations
-- This creates a realistic spread across the city

-- Quick execution:
/*
1. Run METHOD 4 to update all students with realistic Mumbai locations
2. Run verification queries to confirm
3. Test location APIs with Mumbai coordinates
*/

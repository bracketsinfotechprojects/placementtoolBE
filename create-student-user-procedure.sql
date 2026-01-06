-- Complete Student with User Creation Procedure
-- This procedure creates both student and user account in a single transaction

DELIMITER $$

CREATE PROCEDURE CreateStudentWithUserAccount(
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_dob DATE,
    IN p_gender ENUM('Male', 'Female', 'Other'),
    IN p_nationality VARCHAR(100),
    IN p_student_type ENUM('International', 'Domestic', 'Graduate', 'Undergraduate'),
    IN p_status ENUM('active', 'inactive', 'suspended', 'graduated') DEFAULT 'active',
    IN p_primary_mobile VARCHAR(20),
    IN p_password VARCHAR(255) DEFAULT 'test123'
)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_user_id INT;
    DECLARE v_role_id INT;
    DECLARE v_hashed_password VARCHAR(255);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Start transaction
    START TRANSACTION;

    -- Validate email format
    IF p_email IS NULL OR p_email = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email is required';
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE loginID = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('User with email ', p_email, ' already exists');
    END IF;

    -- Create student record
    INSERT INTO students (first_name, last_name, dob, gender, nationality, student_type, status, created_at, updated_at)
    VALUES (p_first_name, p_last_name, p_dob, p_gender, p_nationality, p_student_type, p_status, NOW(), NOW());
    
    SET v_student_id = LAST_INSERT_ID();

    -- Insert primary contact details (email)
    INSERT INTO contact_details (student_id, email, is_primary, created_at, updated_at)
    VALUES (v_student_id, p_email, 1, NOW(), NOW());

    -- Insert mobile if provided
    IF p_primary_mobile IS NOT NULL AND p_primary_mobile != '' THEN
        INSERT INTO contact_details (student_id, mobile, is_primary, created_at, updated_at)
        VALUES (v_student_id, p_primary_mobile, 0, NOW(), NOW());
    END IF;

    -- Hash password (using MySQL's built-in functions)
    SET v_hashed_password = SHA2(p_password, 256);

    -- Get Student role ID
    SELECT role_id INTO v_role_id FROM roles WHERE role_name = 'Student' LIMIT 1;
    
    IF v_role_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student role not found';
    END IF;

    -- Create user account
    INSERT INTO users (loginID, password, userRole, status, created_at, updated_at)
    VALUES (p_email, v_hashed_password, 'Student', p_status, NOW(), NOW());
    
    SET v_user_id = LAST_INSERT_ID();

    -- Assign Student role to user
    INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
    VALUES (v_user_id, v_role_id, NOW(), NOW());

    -- Commit transaction
    COMMIT;

    -- Return created student and user info
    SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        u.id as user_id,
        u.loginID as username,
        'test123' as default_password
    FROM (
        SELECT 
            s.student_id,
            s.first_name,
            s.last_name,
            cd.email
        FROM students s
        LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
        WHERE s.student_id = v_student_id
    ) s
    LEFT JOIN users u ON u.loginID = s.email;

END$$

DELIMITER ;

-- Alternative simpler procedure for bulk operations
CREATE PROCEDURE CreateStudentUserBulk(
    IN student_data JSON
)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_user_id INT;
    DECLARE v_email VARCHAR(255);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Extract data from JSON
    SET v_email = JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.email'));

    -- Validate email doesn't exist
    IF EXISTS (SELECT 1 FROM users WHERE loginID = v_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('User with email ', v_email, ' already exists');
    END IF;

    -- Create student
    INSERT INTO students (
        first_name, 
        last_name, 
        dob, 
        gender, 
        nationality, 
        student_type, 
        status,
        created_at,
        updated_at
    )
    VALUES (
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.first_name')),
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.last_name')),
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.dob')),
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.gender')),
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.nationality')),
        JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.student_type')),
        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.status')), 'active'),
        NOW(),
        NOW()
    );

    SET v_student_id = LAST_INSERT_ID();

    -- Create user account
    INSERT INTO users (loginID, password, userRole, status, created_at, updated_at)
    VALUES (
        v_email,
        SHA2('test123', 256),
        'Student',
        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(student_data, '$.status')), 'active'),
        NOW(),
        NOW()
    );

    SET v_user_id = LAST_INSERT_ID();

    -- Assign role
    INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
    SELECT v_user_id, role_id, NOW(), NOW() FROM roles WHERE role_name = 'Student' LIMIT 1;

    COMMIT;

    SELECT v_student_id as student_id, v_user_id as user_id, v_email as email;

END$$

-- Procedure to sync existing students with users
CREATE PROCEDURE SyncExistingStudentsWithUsers()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    DECLARE v_email VARCHAR(255);
    DECLARE v_user_id INT;
    DECLARE v_role_id INT;
    DECLARE cur CURSOR FOR 
        SELECT DISTINCT s.student_id, cd.email
        FROM students s
        JOIN contact_details cd ON s.student_id = cd.student_id
        WHERE cd.email IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM users WHERE loginID = cd.email)
        AND cd.is_primary = 1;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Get Student role ID
    SELECT role_id INTO v_role_id FROM roles WHERE role_name = 'Student' LIMIT 1;
    
    IF v_role_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student role not found';
    END IF;

    -- Loop through students without user accounts
    cur_loop: LOOP
        FETCH cur INTO v_student_id, v_email;
        IF done THEN
            LEAVE cur_loop;
        END IF;

        -- Create user account for existing student
        INSERT INTO users (loginID, password, userRole, status, created_at, updated_at)
        SELECT v_email, SHA2('changeme123', 256), 'Student', s.status, NOW(), NOW()
        FROM students s WHERE s.student_id = v_student_id;

        SET v_user_id = LAST_INSERT_ID();

        -- Assign Student role
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (v_user_id, v_role_id, NOW(), NOW());

    END LOOP;

    COMMIT;
    
    SELECT CONCAT('Synced ', ROW_COUNT(), ' students with user accounts') as result;

END$$

-- Usage examples:

-- Single student creation:
-- CALL CreateStudentWithUserAccount(
--     'John', 'Doe', 'john.doe@email.com', 
--     '1995-01-01', 'Male', 'Canadian', 
--     'Undergraduate', 'active', '+1234567890'
-- );

-- Bulk creation with JSON:
-- CALL CreateStudentUserBulk('{
--     "first_name": "Jane", 
--     "last_name": "Smith", 
--     "email": "jane.smith@email.com",
--     "dob": "1996-05-15",
--     "gender": "Female",
--     "nationality": "Canadian",
--     "student_type": "Graduate",
--     "status": "active"
-- }');

-- Sync existing students:
-- CALL SyncExistingStudentsWithUsers();
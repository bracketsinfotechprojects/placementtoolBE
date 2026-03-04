import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Placement Tool API',
      version: '1.0.0',
      description: 'Complete API documentation for Placement Tool Backend',
      contact: {
        name: 'API Support',
        email: 'support@placementtool.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      },
      {
        url: 'https://api.placementtool.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            loginID: { type: 'string' },
            roleID: { type: 'integer' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Student: {
          type: 'object',
          properties: {
            student_id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            dob: { type: 'string', format: 'date' },
            gender: { type: 'string' },
            nationality: { type: 'string' },
            student_type: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['loginID', 'password'],
          properties: {
            loginID: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'test123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
            expiresIn: { type: 'integer' },
            tokenType: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        },
        Facility: {
          type: 'object',
          properties: {
            facility_id: { type: 'integer' },
            organization_name: { type: 'string' },
            registered_business_name: { type: 'string' },
            website_url: { type: 'string' },
            abn_registration_number: { type: 'string' },
            source_of_data: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityAttribute: {
          type: 'object',
          properties: {
            attribute_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            attribute_type: { type: 'string', enum: ['Category', 'State'] },
            attribute_value: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityOrganizationStructure: {
          type: 'object',
          properties: {
            org_struct_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            deal_with: { type: 'string', enum: ['Head Office', 'Branch', 'Both'] },
            head_office_addr: { type: 'string' },
            contact_name: { type: 'string' },
            designation: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            alternate_contact: { type: 'string' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityBranchSite: {
          type: 'object',
          properties: {
            branch_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            site_code: { type: 'string' },
            full_address: { type: 'string' },
            suburb: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            postcode: { type: 'string' },
            site_type: { type: 'string' },
            palliative_care: { type: 'boolean' },
            dementia_care: { type: 'boolean' },
            num_beds: { type: 'integer' },
            gender_rules: { type: 'string' },
            contact_name: { type: 'string' },
            contact_role: { type: 'string' },
            contact_phone: { type: 'string' },
            contact_email: { type: 'string' },
            contact_comments: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityAgreement: {
          type: 'object',
          properties: {
            agreement_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            sent_students: { type: 'boolean' },
            with_mou: { type: 'boolean' },
            no_mou_but_taken: { type: 'boolean' },
            mou_exists_no_spot: { type: 'boolean' },
            total_students: { type: 'integer' },
            last_placement: { type: 'string', format: 'date' },
            has_mou: { type: 'boolean' },
            signed_on: { type: 'string', format: 'date' },
            expiry_date: { type: 'string', format: 'date' },
            company_name: { type: 'array', items: { type: 'string' } },
            payment_required: { type: 'boolean' },
            amount_per_spot: { type: 'number', format: 'decimal' },
            payment_notes: { type: 'string' },
            mou_document: { type: 'string' },
            insurance_doc: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityDocumentRequired: {
          type: 'object',
          properties: {
            doc_req_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            document_name: { type: 'string' },
            notice_period_days: { type: 'integer' },
            orientation_req: { type: 'boolean' },
            facilitator_req: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilityRule: {
          type: 'object',
          properties: {
            rule_id: { type: 'integer' },
            facility_id: { type: 'integer' },
            obligations: { type: 'string' },
            obligations_univ: { type: 'string' },
            obligations_student: { type: 'string' },
            process_notes: { type: 'string' },
            shift_rules: { type: 'string' },
            attendance_policy: { type: 'string' },
            dress_code: { type: 'string' },
            behaviour_rules: { type: 'string' },
            special_instr: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        File: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            entity_type: { type: 'string', enum: ['student', 'facility', 'placement', 'visa', 'job', 'agreement', 'trainer', 'placement_executive', 'facility_supervisor'] },
            entity_id: { type: 'integer' },
            doc_type: { type: 'string', enum: ['AADHAAR', 'PASSPORT', 'VISA_DOCUMENT', 'OFFER_LETTER', 'REGISTRATION_PROOF', 'SUPPORTING_DOCUMENT', 'MOU_DOCUMENT', 'INSURANCE_DOCUMENT', 'PLACEMENT_DOCUMENT', 'JOB_OFFER', 'WORK_CHILD_CHECK', 'POLICE_CHECK', 'ACCRED_CERT', 'FIRSTAID_CERT', 'INSURANCE_DOCS', 'RESUME', 'PHOTOGRAPH', 'ID_PROOF', 'AUTHORIZATION_LETTER', 'OTHER'] },
            file_path: { type: 'string' },
            file_name: { type: 'string' },
            mime_type: { type: 'string' },
            file_size: { type: 'integer' },
            version: { type: 'integer' },
            is_active: { type: 'boolean' },
            uploaded_at: { type: 'string', format: 'date-time' },
            expiry_date: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        PlacementExecutive: {
          type: 'object',
          properties: {
            executive_id: { type: 'integer' },
            full_name: { type: 'string' },
            mobile_number: { type: 'string' },
            email: { type: 'string' },
            photograph: { type: 'string' },
            joining_date: { type: 'string', format: 'date' },
            employment_type: { type: 'array', items: { type: 'string' } },
            facility_types_handled: { type: 'array', items: { type: 'string' } },
            user_id: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        FacilitySupervisor: {
          type: 'object',
          properties: {
            supervisor_id: { type: 'integer' },
            full_name: { type: 'string' },
            designation: { type: 'string' },
            mobile_number: { type: 'string' },
            email: { type: 'string' },
            photograph: { type: 'string' },
            facility_id: { type: 'integer' },
            facility_name: { type: 'string' },
            branch_site: { type: 'string' },
            facility_types: { type: 'array', items: { type: 'string' } },
            facility_address: { type: 'string' },
            max_students_can_handle: { type: 'integer' },
            id_proof_document: { type: 'string' },
            police_check_document: { type: 'string' },
            authorization_letter_document: { type: 'string' },
            portal_access_enabled: { type: 'boolean' },
            user_id: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        Trainer: {
          type: 'object',
          properties: {
            trainer_id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            gender: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            mobile_number: { type: 'string' },
            alternate_contact: { type: 'string' },
            email: { type: 'string' },
            trainer_type: { type: 'array', items: { type: 'string' } },
            course_auth: { type: 'array', items: { type: 'string' } },
            acc_numbers: { type: 'string' },
            yoe: { type: 'integer' },
            state_covered: { type: 'array', items: { type: 'string' } },
            cities_covered: { type: 'array', items: { type: 'string' } },
            available_days: { type: 'array', items: { type: 'string' } },
            time_slots: { type: 'array', items: { type: 'string' } },
            suprise_visit: { type: 'boolean' },
            wwchildcheck: { type: 'integer' },
            wwcExpiryDate: { type: 'string', format: 'date' },
            policeCheckNumber: { type: 'string' },
            policeCheckExpiryDate: { type: 'string', format: 'date' },
            photograph: { type: 'string' },
            user_id: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        CourseSlots: {
          type: 'object',
          properties: {
            course_id: { type: 'integer' },
            course_name: { type: 'string', example: 'Manual Handling Training' },
            course_category: { 
              type: 'array', 
              items: { type: 'string', enum: ['Manual Handling', 'First Aid'] },
              example: ['Manual Handling']
            },
            course_type: { 
              type: 'array', 
              items: { type: 'string', enum: ['Accredited', 'Non-Accredited', 'Refresher'] },
              example: ['Accredited']
            },
            course_scope: { 
              type: 'array', 
              items: { type: 'string', enum: ['Aged Care', 'Disability', 'Healthcare Students'] },
              example: ['Aged Care', 'Disability']
            },
            course_date: { type: 'string', format: 'date', example: '2026-03-15' },
            day_of_week: { type: 'string', example: 'Monday' },
            reporting_time: { type: 'string', example: '09:00:00' },
            expected_end_time: { type: 'string', example: '13:00:00' },
            total_duration: { type: 'string', example: '4 hours' },
            mode: { 
              type: 'array', 
              items: { type: 'string', enum: ['Onsite', 'Online', 'Hybrid'] },
              example: ['Onsite']
            },
            training_location: { type: 'string', example: 'ABC Training Center' },
            address: { type: 'string', example: '123 Training Street, Sydney NSW 2000' },
            city: { type: 'string', example: 'Sydney' },
            google_maps_link: { type: 'string', example: 'https://maps.google.com/?q=123+Training+Street+Sydney' },
            total_seats: { type: 'integer', example: 20 },
            seats_remaining: { type: 'integer', example: 15 },
            seat_status: { type: 'string', enum: ['Available', 'Filling Fast', 'Full'], example: 'Available' },
            last_booking_date: { type: 'string', format: 'date', example: '2026-03-10' },
            certificate_issued: { type: 'boolean', example: false },
            certificate_type: { 
              type: 'array', 
              items: { type: 'string', enum: ['Digital', 'Physical'] },
              example: ['Digital']
            },
            certificate_validity: { type: 'string', example: '12 months' },
            issuing_authority: { 
              type: 'array', 
              items: { type: 'string', enum: ['Institute', 'Registered Body'] },
              example: ['Institute']
            },
            certificate_issue_timeline: { type: 'string', enum: ['Same Day', 'Within 48 Hours'], example: 'Same Day' },
            target_audience: { 
              type: 'array', 
              items: { type: 'string', enum: ['External', 'Internal'] },
              example: ['External', 'Internal']
            },
            documents_required: { 
              type: 'array', 
              items: { type: 'string', enum: ['ID Proof', 'Payment Receipt'] },
              example: ['ID Proof', 'Payment Receipt']
            },
            pre_course_requirement: { 
              type: 'array', 
              items: { type: 'string', enum: ['Online Module', 'None'] },
              example: ['Online Module']
            },
            dress_code: { type: 'string', example: 'Comfortable clothing, closed-toe shoes' },
            items_to_bring: { 
              type: 'array', 
              items: { type: 'string', enum: ['Notebook & Pen', 'Water Bottle'] },
              example: ['Notebook & Pen', 'Water Bottle']
            },
            mobile_phone_policy: { type: 'string', enum: ['Silent', 'Restricted'], example: 'Silent' },
            trainer_id: { type: 'integer', example: 1 },
            created_by: { type: 'string', example: 'admin' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        CourseSlotsInput: {
          type: 'object',
          required: ['course_name', 'course_category', 'course_date'],
          properties: {
            course_name: { type: 'string', example: 'Manual Handling Training' },
            course_category: { 
              type: 'array', 
              items: { type: 'string', enum: ['Manual Handling', 'First Aid'] },
              example: ['Manual Handling']
            },
            course_type: { 
              type: 'array', 
              items: { type: 'string', enum: ['Accredited', 'Non-Accredited', 'Refresher'] }
            },
            course_scope: { 
              type: 'array', 
              items: { type: 'string', enum: ['Aged Care', 'Disability', 'Healthcare Students'] }
            },
            course_date: { type: 'string', format: 'date', example: '2026-03-15' },
            day_of_week: { type: 'string', example: 'Monday' },
            reporting_time: { type: 'string', example: '09:00:00' },
            expected_end_time: { type: 'string', example: '13:00:00' },
            total_duration: { type: 'string', example: '4 hours' },
            mode: { 
              type: 'array', 
              items: { type: 'string', enum: ['Onsite', 'Online', 'Hybrid'] }
            },
            training_location: { type: 'string', example: 'ABC Training Center' },
            address: { type: 'string', example: '123 Training Street, Sydney NSW 2000' },
            city: { type: 'string', example: 'Sydney' },
            google_maps_link: { type: 'string', example: 'https://maps.google.com/?q=123+Training+Street+Sydney' },
            total_seats: { type: 'integer', example: 20 },
            seats_remaining: { type: 'integer', example: 15 },
            seat_status: { type: 'string', enum: ['Available', 'Filling Fast', 'Full'] },
            last_booking_date: { type: 'string', format: 'date' },
            certificate_issued: { type: 'boolean', example: false },
            certificate_type: { 
              type: 'array', 
              items: { type: 'string', enum: ['Digital', 'Physical'] }
            },
            certificate_validity: { type: 'string', example: '12 months' },
            issuing_authority: { 
              type: 'array', 
              items: { type: 'string', enum: ['Institute', 'Registered Body'] }
            },
            certificate_issue_timeline: { type: 'string', enum: ['Same Day', 'Within 48 Hours'] },
            target_audience: { 
              type: 'array', 
              items: { type: 'string', enum: ['External', 'Internal'] }
            },
            documents_required: { 
              type: 'array', 
              items: { type: 'string', enum: ['ID Proof', 'Payment Receipt'] }
            },
            pre_course_requirement: { 
              type: 'array', 
              items: { type: 'string', enum: ['Online Module', 'None'] }
            },
            dress_code: { type: 'string', example: 'Comfortable clothing, closed-toe shoes' },
            items_to_bring: { 
              type: 'array', 
              items: { type: 'string', enum: ['Notebook & Pen', 'Water Bottle'] }
            },
            mobile_phone_policy: { type: 'string', enum: ['Silent', 'Restricted'] },
            trainer_id: { type: 'integer', example: 1 },
            created_by: { type: 'string', example: 'admin' }
          }
        },
        CourseAssignment: {
          type: 'object',
          properties: {
            assignment_id: { type: 'integer' },
            course_id: { type: 'integer', example: 1 },
            trainer_id: { type: 'integer', example: 1 },
            student_id: { type: 'integer', example: 1 },
            enrollment_date: { type: 'string', format: 'date', example: '2026-03-15' },
            status: { type: 'string', enum: ['Active', 'Completed', 'Dropped'], example: 'Active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' }
          }
        },
        CourseAssignmentInput: {
          type: 'object',
          required: ['course_id', 'trainer_id', 'student_id'],
          properties: {
            course_id: { type: 'integer', example: 1 },
            trainer_id: { type: 'integer', example: 1 },
            student_id: { type: 'integer', example: 1 },
            enrollment_date: { type: 'string', format: 'date', example: '2026-03-15' },
            status: { type: 'string', enum: ['Active', 'Completed', 'Dropped'], example: 'Active' }
          }
        },
        PlacementSlot: {
          type: 'object',
          properties: {
            placementslot_id: { type: 'integer', description: 'Primary key', example: 1 },
            facility_id: { type: 'string', description: 'Foreign key to Facility table (string)', example: '1' },
            placementslot_type: { type: 'array', items: { type: 'string' }, description: 'Type of placement slot (multi-select)', example: ['Clinical Placement'] },
            course_applicable: { type: 'array', items: { type: 'string' }, description: 'Course applicable for this slot (multi-select)', example: ['CHC33015'] },
            total_slots_offered: { type: 'integer', description: 'Total number of slots offered', example: 5 },
            placement_start_date: { type: 'string', format: 'date', description: 'Placement start date', example: '2026-03-15' },
            placement_end_date: { type: 'string', format: 'date', description: 'Placement end date', example: '2026-04-15' },
            total_hours_required: { type: 'integer', description: 'Total hours required for placement', example: 120 },
            expected_duration: { type: 'array', items: { type: 'string' }, description: 'Expected duration of placement (multi-select)', example: ['4 weeks'] },
            shift_type: { type: 'array', items: { type: 'string' }, description: 'Type of shift (multi-select)', example: ['Morning'] },
            shift_timings: { type: 'string', description: 'Specific shift timings', example: '07:00 - 15:00' },
            working_days: { type: 'array', items: { type: 'string' }, description: 'Working days pattern (multi-select)', example: ['Weekdays'] },
            mandatory_courses: { type: 'array', items: { type: 'string' }, description: 'JSON array of mandatory courses required', example: ['First Aid', 'Manual Handling'] },
            documents_required: { type: 'array', items: { type: 'string' }, description: 'JSON array of required documents', example: ['Police Check', 'Resume'] },
            allowed_visa_types: { type: 'string', description: 'Allowed visa types', example: 'Student Visa, Work Visa' },
            work_hour_limit: { type: 'boolean', description: 'Whether there is a work hour limit', example: true },
            work_hour_limit_details: { type: 'string', description: 'Details about work hour limitations', example: 'Max 20 hours per week' },
            gender_preference: { type: 'array', items: { type: 'string' }, description: 'Gender preference for placement (multi-select)', example: ['Male', 'Female'] },
            dress_code: { type: 'string', description: 'Dress code requirements', example: 'Professional attire' },
            attendance_rules: { type: 'string', description: 'Attendance rules and requirements', example: '95% attendance required' },
            leave_policy: { type: 'string', description: 'Leave policy details', example: 'Sick leave requires medical certificate' },
            behaviour_expectations: { type: 'string', description: 'Expected behavior and conduct', example: 'Professional conduct' },
            placement_fee: { type: 'string', description: 'Placement fee amount (as string)', example: '250.00' },
            placement_fee_status: { type: 'boolean', description: 'Whether placement fee is active/paid', example: true },
            invoice_required: { type: 'boolean', description: 'Whether invoice is required', example: true },
            special_commercial_terms: { type: 'string', description: 'Special commercial terms and conditions', example: 'Payment due within 30 days' },
            urgent_requirement: { type: 'boolean', description: 'Whether this is an urgent requirement', example: true },
            priority_category: { type: 'array', items: { type: 'string' }, description: 'Priority category for this slot (multi-select)', example: ['High'] },
            restrictions: { type: 'string', description: 'Any restrictions for this placement', example: 'No students with criminal history' },
            not_comfortable_with: { type: 'string', description: 'Things not comfortable with for this placement', example: 'Students without proper immunization' },
            created_by: { type: 'integer', description: 'Foreign key to Users table - who created this slot', example: 1 },
            created_at: { type: 'string', format: 'date-time', description: 'Record creation timestamp' },
            is_deleted: { type: 'boolean', description: 'Soft delete flag', example: false },
            facility: { $ref: '#/components/schemas/Facility' },
            creator: { $ref: '#/components/schemas/User' }
          }
        },
        PlacementSlotInput: {
          type: 'object',
          required: ['facility_id'],
          properties: {
            facility_id: { type: 'string', description: 'Facility ID (foreign key as string)', example: '1' },
            placementslot_type: {
              type: 'array',
              items: { type: 'string' },
              description: 'Type of placement slot (multi-select). Send as JSON array.',
              example: ['Clinical Placement']
            },
            course_applicable: {
              type: 'array',
              items: { type: 'string' },
              description: 'Course applicable for this slot (multi-select). Send as JSON array.',
              example: ['CHC33015']
            },
            total_slots_offered: {
              type: 'integer',
              description: 'Total number of slots offered',
              example: 5
            },
            placement_start_date: {
              type: 'string',
              format: 'date',
              description: 'Placement start date',
              example: '2026-03-15'
            },
            placement_end_date: {
              type: 'string',
              format: 'date',
              description: 'Placement end date',
              example: '2026-04-15'
            },
            total_hours_required: {
              type: 'integer',
              description: 'Total hours required for placement',
              example: 120
            },
            expected_duration: {
              type: 'array',
              items: { type: 'string' },
              description: 'Expected duration of placement (multi-select). Send as JSON array.',
              example: ['4 weeks']
            },
            shift_type: {
              type: 'array',
              items: { type: 'string' },
              description: 'Type of shift (multi-select). Send as JSON array.',
              example: ['Morning']
            },
            shift_timings: {
              type: 'string',
              description: 'Specific shift timings',
              example: '07:00 - 15:00'
            },
            working_days: {
              type: 'array',
              items: { type: 'string' },
              description: 'Working days pattern (multi-select). Send as JSON array.',
              example: ['Weekdays']
            },
            mandatory_courses: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of mandatory courses required (multi-select). Send as JSON array.',
              example: ['First Aid', 'Manual Handling', 'Infection Control']
            },
            documents_required: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of required documents (multi-select). Send as JSON array.',
              example: ['Police Check', 'Working with Children Check', 'Resume']
            },
            allowed_visa_types: {
              type: 'string',
              description: 'Allowed visa types',
              example: 'Student Visa, Work Visa, PR'
            },
            work_hour_limit: {
              type: 'boolean',
              description: 'Whether there is a work hour limit',
              example: true
            },
            work_hour_limit_details: {
              type: 'string',
              description: 'Details about work hour limitations (if work_hour_limit is true)',
              example: 'Max 20 hours per week for student visa holders'
            },
            gender_preference: {
              type: 'array',
              items: { type: 'string' },
              description: 'Gender preference for placement (multi-select). Send as JSON array.',
              example: ['Male', 'Female']
            },
            dress_code: {
              type: 'string',
              description: 'Dress code requirements',
              example: 'Professional attire, closed-toe shoes'
            },
            attendance_rules: {
              type: 'string',
              description: 'Attendance rules and requirements',
              example: '95% attendance required. Must inform supervisor 24hrs before absence.'
            },
            leave_policy: {
              type: 'string',
              description: 'Leave policy details',
              example: 'Sick leave requires medical certificate'
            },
            behaviour_expectations: {
              type: 'string',
              description: 'Expected behavior and conduct',
              example: 'Professional conduct, respect for patients and staff'
            },
            placement_fee: {
              type: 'string',
              description: 'Placement fee amount (as string)',
              example: '250.00'
            },
            placement_fee_status: {
              type: 'boolean',
              description: 'Whether placement fee is active/paid',
              example: true
            },
            invoice_required: {
              type: 'boolean',
              description: 'Whether invoice is required',
              example: true
            },
            special_commercial_terms: {
              type: 'string',
              description: 'Special commercial terms and conditions',
              example: 'Payment due within 30 days of placement start'
            },
            urgent_requirement: {
              type: 'boolean',
              description: 'Whether this is an urgent requirement',
              example: false
            },
            priority_category: {
              type: 'array',
              items: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              description: 'Priority category for this slot (multi-select). Send as JSON array.',
              example: ['High']
            },
            restrictions: {
              type: 'string',
              description: 'Any restrictions for this placement',
              example: 'No students with criminal history'
            },
            not_comfortable_with: {
              type: 'string',
              description: 'Things not comfortable with for this placement',
              example: 'Students without proper immunization'
            }
          }
        },
        PlacementAssignment: {
          type: 'object',
          properties: {
            assignment_id: { type: 'integer', description: 'Primary key', example: 1 },
            placementslot_id: { type: 'integer', description: 'Foreign key to placement_slots table', example: 1 },
            student_id: { type: 'integer', description: 'Foreign key to students table', example: 1 },
            status: {
              type: 'string',
              enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped'],
              description: 'Status of the assignment',
              example: 'Assigned'
            },
            start_date: { type: 'string', format: 'date', description: 'Actual start date for this student', example: '2026-03-15' },
            end_date: { type: 'string', format: 'date', description: 'Actual end date for this student', example: '2026-04-15' },
            notes: { type: 'string', description: 'Notes about this assignment', example: 'Student requires additional supervision' },
            created_at: { type: 'string', format: 'date-time', description: 'Record creation timestamp' },
            updated_at: { type: 'string', format: 'date-time', description: 'Record update timestamp' },
            placementSlot: { $ref: '#/components/schemas/PlacementSlot' },
            student: { $ref: '#/components/schemas/Student' }
          }
        },
        PlacementAssignmentInput: {
          type: 'object',
          required: ['placementslot_id', 'student_id'],
          properties: {
            placementslot_id: {
              type: 'integer',
              description: 'Placement slot ID to assign student to',
              example: 1
            },
            student_id: {
              type: 'integer',
              description: 'Student ID to assign',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped'],
              description: 'Status of the assignment (optional, defaults to Assigned)',
              example: 'Assigned'
            },
            notes: {
              type: 'string',
              description: 'Notes about this assignment (optional)',
              example: 'Student requires additional supervision'
            }
          }
        },
        PlacementAssignmentUpdateInput: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped'],
              description: 'Status of the assignment',
              example: 'Active'
            },
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Actual start date for this student',
              example: '2026-03-15'
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: 'Actual end date for this student',
              example: '2026-04-15'
            },
            notes: {
              type: 'string',
              description: 'Notes about this assignment',
              example: 'Student making good progress'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [] as any
      }
    ]
  },
  apis: ['./src/routes/**/*.ts', './dist/routes/**/*.js', './routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

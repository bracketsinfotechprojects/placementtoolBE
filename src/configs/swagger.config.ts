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
            company_name: { type: 'string' },
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
        }
      }
    },
    security: [
      {
        bearerAuth: [] as any
      }
    ]
  },
  apis: ['./dist/routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

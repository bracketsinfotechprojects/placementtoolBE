#!/bin/bash

echo "=== Users API Test Commands ==="
echo ""

echo "1. Create a new user (Admin):"
echo "curl -X POST http://localhost:5555/user \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"loginID\": \"admin123\", \"password\": \"admin123\", \"userRole\": \"admin\", \"status\": \"active\"}'"
echo ""

echo "2. Create a regular user:"
echo "curl -X POST http://localhost:5555/user \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"loginID\": \"user123\", \"password\": \"user123\", \"userRole\": \"user\", \"status\": \"active\"}'"
echo ""

echo "3. User login:"
echo "curl -X POST http://localhost:5555/user/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"loginID\": \"admin123\", \"password\": \"admin123\"}'"
echo ""

echo "4. Get user by ID:"
echo "curl -X GET http://localhost:5555/user/1"
echo ""

echo "5. List all users:"
echo "curl -X GET http://localhost:5555/user"
echo ""

echo "6. List users with pagination:"
echo "curl -X GET 'http://localhost:5555/user?limit=10&page=1'"
echo ""

echo "7. Filter users by status:"
echo "curl -X GET 'http://localhost:5555/user?status=active'"
echo ""

echo "8. Filter users by role:"
echo "curl -X GET 'http://localhost:5555/user?userRole=admin'"
echo ""

echo "9. Search users by keyword:"
echo "curl -X GET 'http://localhost:5555/user?keyword=admin'"
echo ""

echo "10. Update user:"
echo "curl -X PUT http://localhost:5555/user/1 \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"userRole\": \"super_admin\", \"status\": \"active\"}'"
echo ""

echo "11. Delete user (soft delete):"
echo "curl -X DELETE http://localhost:5555/user/1"
echo ""

echo "12. Get user statistics:"
echo "curl -X GET http://localhost:5555/user/stats"
echo ""

echo "=== Sample Test Data ==="
echo ""

echo "# Create test users"
echo "curl -X POST http://localhost:5555/user -H 'Content-Type: application/json' -d '{\"loginID\": \"admin001\", \"password\": \"admin123\", \"userRole\": \"admin\", \"status\": \"active\"}'"
echo "curl -X POST http://localhost:5555/user -H 'Content-Type: application/json' -d '{\"loginID\": \"user001\", \"password\": \"user123\", \"userRole\": \"user\", \"status\": \"active\"}'"
echo "curl -X POST http://localhost:5555/user -H 'Content-Type: application/json' -d '{\"loginID\": \"manager001\", \"password\": \"manager123\", \"userRole\": \"manager\", \"status\": \"active\"}'"
echo "curl -X POST http://localhost:5555/user -H 'Content-Type: application/json' -d '{\"loginID\": \"inactive001\", \"password\": \"inactive123\", \"userRole\": \"user\", \"status\": \"inactive\"}'"
echo ""

echo "=== Important Notes ==="
echo "- Base URL: http://localhost:5555/"
echo "- User endpoints are under /user (not /users)"
echo "- Required fields for user creation: loginID, password"
echo "- Optional fields: userRole (default: 'user'), status (default: 'active')"
echo "- Passwords should be hashed in production (currently stored as plain text for testing)"
echo "- LoginID must be unique (enforced by database constraint)"
echo "- User roles: admin, user, manager, etc. (customizable)"
echo "- Status values: active, inactive, etc."
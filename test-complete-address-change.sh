#!/bin/bash

echo "=== Complete Address Change Request API Test ==="
echo ""

# Test 1: Create Student
echo "📝 Test 1: Creating student with complete data..."
echo "POST /api/students"
echo ""

STUDENT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/students \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d @final-test-complete.json)

echo "Student Creation Response:"
echo "$STUDENT_RESPONSE" | jq '.' 2>/dev/null || echo "$STUDENT_RESPONSE"
echo ""

# Extract student_id from response
STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data.student_id // empty' 2>/dev/null)

if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" = "null" ]; then
    echo "❌ Student creation failed. Using test student_id: 1"
    STUDENT_ID=1
else
    echo "✅ Student created successfully with ID: $STUDENT_ID"
fi

echo ""
echo "---"
echo ""

# Test 2: Create Address Change Request
echo "📝 Test 2: Creating address change request..."
echo "POST /api/students/$STUDENT_ID/address-change-requests"
echo ""

# Extract the address change request data
CURRENT_ADDRESS=$(jq -r '.address_change_request.current_address' final-test-complete.json)
NEW_ADDRESS=$(jq -r '.address_change_request.new_address' final-test-complete.json)
EFFECTIVE_DATE=$(jq -r '.address_change_request.effective_date' final-test-complete.json)
CHANGE_REASON=$(jq -r '.address_change_request.change_reason' final-test-complete.json)
IMPACT_ACK=$(jq -r '.address_change_request.impact_acknowledged' final-test-complete.json)

curl -X POST http://localhost:3000/api/students/$STUDENT_ID/address-change-requests \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d "{
    \"current_address\": \"$CURRENT_ADDRESS\",
    \"new_address\": \"$NEW_ADDRESS\",
    \"effective_date\": \"$EFFECTIVE_DATE\",
    \"change_reason\": \"$CHANGE_REASON\",
    \"impact_acknowledged\": $IMPACT_ACK
  }" | jq '.' 2>/dev/null || cat

echo ""
echo "---"
echo ""

# Test 3: Retrieve Address Change Requests
echo "📝 Test 3: Retrieving address change requests..."
echo "GET /api/students/$STUDENT_ID/address-change-requests"
echo ""

curl -s -X GET http://localhost:3000/api/students/$STUDENT_ID/address-change-requests \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' | jq '.' 2>/dev/null || cat

echo ""
echo "---"
echo ""

# Test 4: Verify in Database
echo "📝 Test 4: Database verification..."
echo ""

echo "Database Query Results:"
echo ""

# Check if student exists
echo "📋 Student Record:"
mysql -u root -p'YOUR_PASSWORD' -D crm_database -e "SELECT student_id, first_name, last_name, email, status FROM students WHERE student_id = $STUDENT_ID;" 2>/dev/null || echo "MySQL connection failed - check credentials"

echo ""
echo "📋 Address Change Request Record:"
mysql -u root -p'YOUR_PASSWORD' -D crm_database -e "
SELECT acr_id, student_id, current_address, new_address, effective_date, change_reason, impact_acknowledged, status, created_at 
FROM address_change_requests 
WHERE student_id = $STUDENT_ID;" 2>/dev/null || echo "MySQL connection failed - check credentials"

echo ""
echo "📋 Summary Statistics:"
mysql -u root -p'YOUR_PASSWORD' -D crm_database -e "
SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'contact_details', COUNT(*) FROM contact_details
UNION ALL
SELECT 'visa_details', COUNT(*) FROM visa_details  
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'address_change_requests', COUNT(*) FROM address_change_requests;" 2>/dev/null || echo "MySQL connection failed - check credentials"

echo ""
echo "=== Test Complete ==="
echo ""
echo "💡 Next Steps:"
echo "1. Replace 'YOUR_TOKEN_HERE' with actual JWT token"
echo "2. Replace 'YOUR_PASSWORD' with actual MySQL password"
echo "3. Ensure the server is running on port 3000"
echo "4. Check API responses and database records"
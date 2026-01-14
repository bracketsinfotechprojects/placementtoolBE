#!/bin/bash

# Facility Update API Test Script
# Usage: ./test_facility_update.sh

# Configuration
BASE_URL="http://localhost:3000/api/facilities"
FACILITY_ID=1
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "=========================================="
echo "Facility Update API Test Script"
echo "=========================================="
echo ""

# Test 1: Basic Update (Main Fields Only)
echo "Test 1: Basic Update - Updating organization name"
echo "------------------------------------------"
curl -X PUT "${BASE_URL}/${FACILITY_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "organization_name": "Test Updated Facility Name",
    "website_url": "https://testupdated.com"
  }' | json_pp

echo ""
echo ""

# Test 2: Complete Update - Update Attributes Only
echo "Test 2: Complete Update - Updating attributes only"
echo "------------------------------------------"
curl -X PUT "${BASE_URL}/${FACILITY_ID}/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "attributes": [
      {
        "attribute_type": "Category",
        "attribute_value": "Aged Care"
      },
      {
        "attribute_type": "State",
        "attribute_value": "VIC"
      }
    ]
  }' | json_pp

echo ""
echo ""

# Test 3: Complete Update - Update Multiple Entities
echo "Test 3: Complete Update - Updating multiple entities"
echo "------------------------------------------"
curl -X PUT "${BASE_URL}/${FACILITY_ID}/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "organization_name": "Comprehensive Test Update",
    "attributes": [
      {
        "attribute_type": "Category",
        "attribute_value": "Aged Care"
      }
    ],
    "branches": [
      {
        "site_code": "TEST001",
        "city": "Melbourne",
        "state": "VIC",
        "postcode": "3000",
        "num_beds": 50
      }
    ],
    "agreements": [
      {
        "has_mou": true,
        "total_students": 15,
        "signed_on": "2025-01-01",
        "expiry_date": "2027-01-01"
      }
    ]
  }' | json_pp

echo ""
echo ""

# Test 4: Get Updated Facility
echo "Test 4: Retrieving updated facility"
echo "------------------------------------------"
curl -X GET "${BASE_URL}/${FACILITY_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | json_pp

echo ""
echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="

# Facility Update API Test Script (PowerShell)
# Usage: .\test_facility_update.ps1

# Configuration
$BaseUrl = "http://localhost:3000/api/facilities"
$FacilityId = 1
$Token = "YOUR_JWT_TOKEN_HERE"

$Headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $Token"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Facility Update API Test Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic Update (Main Fields Only)
Write-Host "Test 1: Basic Update - Updating organization name" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

$Body1 = @{
    organization_name = "Test Updated Facility Name"
    website_url = "https://testupdated.com"
} | ConvertTo-Json

try {
    $Response1 = Invoke-RestMethod -Uri "$BaseUrl/$FacilityId" -Method Put -Headers $Headers -Body $Body1
    $Response1 | ConvertTo-Json -Depth 10
    Write-Host "✓ Test 1 Passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Test 1 Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Complete Update - Update Attributes Only
Write-Host "Test 2: Complete Update - Updating attributes only" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

$Body2 = @{
    attributes = @(
        @{
            attribute_type = "Category"
            attribute_value = "Aged Care"
        },
        @{
            attribute_type = "State"
            attribute_value = "VIC"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $Response2 = Invoke-RestMethod -Uri "$BaseUrl/$FacilityId/complete" -Method Put -Headers $Headers -Body $Body2
    $Response2 | ConvertTo-Json -Depth 10
    Write-Host "✓ Test 2 Passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Test 2 Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Complete Update - Update Multiple Entities
Write-Host "Test 3: Complete Update - Updating multiple entities" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

$Body3 = @{
    organization_name = "Comprehensive Test Update"
    attributes = @(
        @{
            attribute_type = "Category"
            attribute_value = "Aged Care"
        }
    )
    branches = @(
        @{
            site_code = "TEST001"
            city = "Melbourne"
            state = "VIC"
            postcode = "3000"
            num_beds = 50
        }
    )
    agreements = @(
        @{
            has_mou = $true
            total_students = 15
            signed_on = "2025-01-01"
            expiry_date = "2027-01-01"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $Response3 = Invoke-RestMethod -Uri "$BaseUrl/$FacilityId/complete" -Method Put -Headers $Headers -Body $Body3
    $Response3 | ConvertTo-Json -Depth 10
    Write-Host "✓ Test 3 Passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Test 3 Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 4: Get Updated Facility
Write-Host "Test 4: Retrieving updated facility" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow

try {
    $Response4 = Invoke-RestMethod -Uri "$BaseUrl/$FacilityId" -Method Get -Headers $Headers
    $Response4 | ConvertTo-Json -Depth 10
    Write-Host "✓ Test 4 Passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Test 4 Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

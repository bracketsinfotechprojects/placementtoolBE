# Test Address Change Request with Nested Payload Structure (PowerShell)
# Usage: .\test-address-change-nested.ps1 -StudentId 123 -Token "YOUR_TOKEN"

param(
    [int]$StudentId = 123,
    [string]$Token = "YOUR_TOKEN_HERE",
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "🧪 Testing Address Change Request API with Nested Payload" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Student ID: $StudentId"
Write-Host "Endpoint: POST $BaseUrl/api/students/$StudentId/address-change-requests"
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

$body = @{
    line1 = "456 George Street"
    line2 = "Unit 12, Level 5"
    suburb = "Haymarket"
    city = "Sydney"
    state = "NSW"
    country = "Australia"
    postal_code = "2000"
    address_type = "current"
    is_primary = $true
    change_request = @{
        current_address = "123 Main Street, Sydney NSW 2000"
        new_address = "789 New Street, Sydney NSW 2001"
        effective_date = "2026-03-01"
        change_reason = "Moving closer to placement facility"
        impact_acknowledged = $true
        status = "pending"
        reviewed_at = $null
        reviewed_by = $null
        review_comments = $null
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/students/$StudentId/address-change-requests" `
        -Method Post `
        -Headers $headers `
        -Body $body
    
    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host ""
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Expected result:" -ForegroundColor Yellow
Write-Host "- Address change request created in address_change_requests table"
Write-Host "- New address created in addresses table"
Write-Host "- Response includes both address_change_request and new_address_id"

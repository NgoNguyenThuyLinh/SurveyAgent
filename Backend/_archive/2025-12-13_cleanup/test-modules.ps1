# Test Modular Architecture Endpoints
# PowerShell script to test all module endpoints

$baseUrl = "http://localhost:5000/api/modules"
$token = ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MODULAR ARCHITECTURE API TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login (auth-rbac module)
Write-Host "[Test 1] AUTH-RBAC Module: Login" -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin1"
        password = "pass123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    if ($loginResponse.success) {
        $token = $loginResponse.data.token
        Write-Host "[OK] Login successful!" -ForegroundColor Green
        Write-Host "     Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "     User: $($loginResponse.data.user.username) (Role: $($loginResponse.data.user.role))" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Login failed: $_" -ForegroundColor Red
}
Write-Host ""

if (!$token) {
    Write-Host "[WARNING] No token obtained. Skipping authenticated endpoints." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 2: Get Profile (auth-rbac)
Write-Host "[Test 2] AUTH-RBAC Module: Get Profile" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" `
        -Method Get `
        -Headers $headers

    if ($profileResponse.success) {
        Write-Host "[OK] Profile retrieved!" -ForegroundColor Green
        Write-Host "     Name: $($profileResponse.data.user.full_name)" -ForegroundColor Gray
        Write-Host "     Email: $($profileResponse.data.user.email)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get profile failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Surveys (surveys module)
Write-Host "[Test 3] SURVEYS Module: List Surveys" -ForegroundColor Yellow
try {
    $surveysResponse = Invoke-RestMethod -Uri "$baseUrl/surveys?page=1&limit=5" `
        -Method Get `
        -Headers $headers

    if ($surveysResponse.success) {
        Write-Host "[OK] Surveys retrieved!" -ForegroundColor Green
        Write-Host "     Total: $($surveysResponse.data.pagination.total)" -ForegroundColor Gray
        Write-Host "     Page: $($surveysResponse.data.pagination.page)/$($surveysResponse.data.pagination.totalPages)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get surveys failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Survey by ID (surveys module)
Write-Host "[Test 4] SURVEYS Module: Get Survey by ID" -ForegroundColor Yellow
try {
    $surveyResponse = Invoke-RestMethod -Uri "$baseUrl/surveys/1" `
        -Method Get `
        -Headers $headers

    if ($surveyResponse.success) {
        Write-Host "[OK] Survey retrieved!" -ForegroundColor Green
        Write-Host "     Title: $($surveyResponse.data.survey.title)" -ForegroundColor Gray
        Write-Host "     Status: $($surveyResponse.data.survey.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get survey failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Templates (templates module)
Write-Host "[Test 5] TEMPLATES Module: List Templates" -ForegroundColor Yellow
try {
    $templatesResponse = Invoke-RestMethod -Uri "$baseUrl/templates?page=1&limit=5" `
        -Method Get `
        -Headers $headers

    if ($templatesResponse.success) {
        Write-Host "[OK] Templates retrieved!" -ForegroundColor Green
        Write-Host "     Total: $($templatesResponse.data.pagination.total)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get templates failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Question Types (templates module)
Write-Host "[Test 6] TEMPLATES Module: Get Question Types" -ForegroundColor Yellow
try {
    $typesResponse = Invoke-RestMethod -Uri "$baseUrl/templates/question-types" `
        -Method Get `
        -Headers $headers

    if ($typesResponse.success) {
        Write-Host "[OK] Question types retrieved!" -ForegroundColor Green
        Write-Host "     Count: $($typesResponse.data.types.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get question types failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get My Responses (responses module)
Write-Host "[Test 7] RESPONSES Module: Get My Responses" -ForegroundColor Yellow
try {
    $myResponsesResponse = Invoke-RestMethod -Uri "$baseUrl/responses/my-responses" `
        -Method Get `
        -Headers $headers

    if ($myResponsesResponse.success) {
        Write-Host "[OK] My responses retrieved!" -ForegroundColor Green
        Write-Host "     Total: $($myResponsesResponse.data.pagination.total)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get my responses failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get Dashboard Stats (analytics module)
Write-Host "[Test 8] ANALYTICS Module: Dashboard Stats" -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" `
        -Method Get `
        -Headers $headers

    if ($dashboardResponse.success) {
        Write-Host "[OK] Dashboard stats retrieved!" -ForegroundColor Green
        Write-Host "     Total Surveys: $($dashboardResponse.data.total_surveys)" -ForegroundColor Gray
        Write-Host "     Active Surveys: $($dashboardResponse.data.active_surveys)" -ForegroundColor Gray
        Write-Host "     Total Responses: $($dashboardResponse.data.total_responses)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get dashboard stats failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Get Export Metadata (export module)
Write-Host "[Test 9] EXPORT Module: Export Metadata" -ForegroundColor Yellow
try {
    $exportMetaResponse = Invoke-RestMethod -Uri "$baseUrl/export/survey/1/metadata" `
        -Method Get `
        -Headers $headers

    if ($exportMetaResponse.success) {
        Write-Host "[OK] Export metadata retrieved!" -ForegroundColor Green
        Write-Host "     Survey: $($exportMetaResponse.data.survey_title)" -ForegroundColor Gray
        Write-Host "     Response Count: $($exportMetaResponse.data.response_count)" -ForegroundColor Gray
        Write-Host "     Can Export: $($exportMetaResponse.data.can_export)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get export metadata failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 10: Get Collectors (collectors module)
Write-Host "[Test 10] COLLECTORS Module: Get Collectors" -ForegroundColor Yellow
try {
    $collectorsResponse = Invoke-RestMethod -Uri "$baseUrl/collectors/survey/1" `
        -Method Get `
        -Headers $headers

    if ($collectorsResponse.success) {
        Write-Host "[OK] Collectors retrieved!" -ForegroundColor Green
        Write-Host "     Count: $($collectorsResponse.data.collectors.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Get collectors failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MODULE TESTING COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All modular endpoints are available at:" -ForegroundColor Yellow
Write-Host "$baseUrl/<module-name>/<endpoint>" -ForegroundColor Cyan
Write-Host ""
Write-Host "See Backend/modules/README.md for full documentation" -ForegroundColor Yellow

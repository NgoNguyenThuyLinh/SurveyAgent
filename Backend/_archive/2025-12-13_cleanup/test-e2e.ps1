#!/usr/bin/env pwsh
# Test script for survey creation flow

$ApiBase = "http://localhost:5000"
$JwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMH0.test"

function Invoke-API($Method, $Path, $Body) {
    $Url = "$ApiBase$Path"
    $Headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $JwtToken"
    }
    
    try {
        if ($Body) {
            $Response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body ($Body | ConvertTo-Json -Depth 10) -ErrorAction Stop
        } else {
            $Response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -ErrorAction Stop
        }
        return @{
            Success = $true
            Data = $Response
            Status = 200
        }
    } catch {
        return @{
            Success = $false
            Data = $_.Exception.Response
            Status = $_.Exception.Response.StatusCode
            Error = $_.Exception.Message
        }
    }
}

Write-Host "`n🚀 STARTING END-TO-END SURVEY CREATION TEST`n" -ForegroundColor Cyan
Write-Host ("=" * 80)

# STEP 1: Get Categories
Write-Host "`n📋 STEP 1: Get Categories" -ForegroundColor Yellow
Write-Host ("-" * 80)

$catResponse = Invoke-API "GET" "/api/modules/llm/categories" $null

if ($catResponse.Success) {
    Write-Host "✅ Categories fetched successfully" -ForegroundColor Green
    $catResponse.Data.data | ForEach-Object {
        Write-Host "   • $($_.name) ($($_.id))" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to fetch categories: $($catResponse.Error)" -ForegroundColor Red
}

# STEP 2: Generate Questions
Write-Host "`n🤖 STEP 2: Generate Questions" -ForegroundColor Yellow
Write-Host ("-" * 80)

$genPayload = @{
    topic = "customer satisfaction survey"
    count = 3
    category = "general"
}

$genResponse = Invoke-API "POST" "/api/modules/llm/generate-questions" $genPayload

if ($genResponse.Success) {
    $qCount = $genResponse.Data.data.questions.Count
    Write-Host "✅ Generated $qCount questions" -ForegroundColor Green
    
    if ($qCount -gt 0) {
        Write-Host "   Sample questions:" -ForegroundColor Gray
        $genResponse.Data.data.questions | Select-Object -First 2 | ForEach-Object {
            Write-Host "     • $($_.question -or $_.text)" -ForegroundColor Gray
        }
        $script:GeneratedQuestions = $genResponse.Data.data.questions
    }
} else {
    Write-Host "❌ Failed to generate questions: $($genResponse.Error)" -ForegroundColor Red
}

# STEP 3: Create Survey
Write-Host "`n📝 STEP 3: Create Survey" -ForegroundColor Yellow
Write-Host ("-" * 80)

if ($script:GeneratedQuestions.Count -gt 0) {
    $surveyPayload = @{
        title = "Test AI Survey - $(Get-Date -Format 'yyyyMMddHHmmss')"
        description = "This is a test survey created via API"
        selectedQuestions = @(
            @{
                question = $script:GeneratedQuestions[0].question
                type = $script:GeneratedQuestions[0].type -or "text"
                required = $true
                options = @()
            }
        )
        customQuestions = @(
            @{
                question_text = "Your feedback?"
                question_type = "open_ended"
                is_required = $false
                options = @()
            }
        )
        targetAudience = "all_users"
        startDate = (Get-Date).ToUniversalTime().ToString("o")
        endDate = (Get-Date).AddDays(30).ToUniversalTime().ToString("o")
        shareSettings = @{
            isPublic = $false
            allowAnonymous = $true
            requireLogin = $false
        }
    }
    
    $surveyResponse = Invoke-API "POST" "/api/modules/llm/create-survey" $surveyPayload
    
    if ($surveyResponse.Success) {
        $surveyId = $surveyResponse.Data.data.survey.id
        $templateId = $surveyResponse.Data.data.survey.template_id
        $totalQuestions = $surveyResponse.Data.data.totalQuestions
        
        Write-Host "✅ Survey created successfully" -ForegroundColor Green
        Write-Host "   • Survey ID: $surveyId" -ForegroundColor Gray
        Write-Host "   • Template ID: $templateId" -ForegroundColor Gray
        Write-Host "   • Total Questions: $totalQuestions" -ForegroundColor Gray
        Write-Host "   • Title: $($surveyResponse.Data.data.survey.title)" -ForegroundColor Gray
        
        $script:SurveyId = $surveyId
    } else {
        Write-Host "❌ Failed to create survey: $($surveyResponse.Error)" -ForegroundColor Red
        if ($surveyResponse.Data) {
            Write-Host "   Response: $($surveyResponse.Data | ConvertTo-Json -Depth 2)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️  Skipped - No generated questions available" -ForegroundColor Yellow
}

# STEP 4: Verify Database
Write-Host "`n💾 STEP 4: Verify Database" -ForegroundColor Yellow
Write-Host ("-" * 80)

if ($script:SurveyId) {
    $verifyResponse = Invoke-API "GET" "/api/modules/surveys/$($script:SurveyId)" $null
    
    if ($verifyResponse.Success) {
        Write-Host "✅ Survey verified in database" -ForegroundColor Green
        $survey = $verifyResponse.Data.data
        Write-Host "   • Title: $($survey.title)" -ForegroundColor Gray
        Write-Host "   • Status: $($survey.status)" -ForegroundColor Gray
        Write-Host "   • Created by: User $($survey.created_by)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to verify survey: $($verifyResponse.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped - No survey ID available" -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 80)
Write-Host "✅ TEST COMPLETED`n" -ForegroundColor Cyan

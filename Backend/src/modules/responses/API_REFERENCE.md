# Response Lifecycle API Reference

## Overview
These endpoints manage the survey response lifecycle with proper status tracking, validation, and audit logging.

### Response Status Workflow
```
started → save (activity update) → complete (submit) → [stored]
        └─→ abandon (user leaves)
```

---

## 1. POST /api/modules/responses/start

**Description**: Initialize a new survey response with `status='started'`

**Access**: Public/Private (no auth required for public responses)

**Request Body**:
```json
{
  "surveyId": 123,
  "collectorToken": "token_abc123",
  "sessionId": "session_xyz789" // Optional, for anonymous tracking
}
```

**Success Response (201)**:
```json
{
  "ok": true,
  "message": "Response started",
  "data": {
    "responseId": 456,
    "surveyId": 123,
    "status": "started",
    "startedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Survey not found (code: `SURVEY_NOT_FOUND`)
- `400 Bad Request`: Collector inactive (code: `COLLECTOR_INACTIVE`)

**Implementation Notes**:
- Creates `SurveyResponse` with `status='started'` and `started_at=now`
- Sets `last_activity_at` to prevent immediate abandonment
- Does NOT require answers on start
- Validation: Survey config validated, collector verified as active
- Audit: Response creation logged if auditService available

---

## 2. PUT /api/modules/responses/{responseId}/save

**Description**: Save/autosave response answers and update last activity timestamp

**Access**: Public/Private

**Request Body**:
```json
{
  "answers": [
    {
      "question_id": 101,
      "option_id": 205, // Optional for text/numeric answers
      "answer_text": "This is my answer",
      "value_number": 42,
      "value_json": { "custom": "data" }
    }
  ]
}
```

**Success Response (200)**:
```json
{
  "ok": true,
  "message": "Response saved",
  "data": {
    "responseId": 456,
    "status": "started",
    "lastActivityAt": "2024-01-15T10:35:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Response not found (code: `RESPONSE_NOT_FOUND`)
- `400 Bad Request`: Response already completed (code: `RESPONSE_COMPLETED`)

**Implementation Notes**:
- Does NOT change status
- Updates `last_activity_at` to current time (prevents abandonment marking)
- Replaces previous answers entirely (full save, not merge)
- Can be called multiple times (progressive save for auto-save features)
- No validation of answer values (happens on complete)
- Access: Checks `respondent_user_id` matches user

---

## 3. POST /api/modules/responses/{responseId}/complete

**Description**: Submit/complete response with final validation

**Access**: Public/Private

**Request Body**:
```json
{
  "answers": [
    {
      "question_id": 101,
      "option_id": 205,
      "answer_text": "Final answer"
    }
  ]
  // Optional - if provided, replaces saved answers
}
```

**Success Response (200)**:
```json
{
  "ok": true,
  "message": "Response submitted successfully",
  "data": {
    "responseId": 456,
    "status": "completed",
    "completedAt": "2024-01-15T10:45:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Response not found (code: `RESPONSE_NOT_FOUND`)
- `400 Bad Request`: Response already completed (code: `RESPONSE_ALREADY_COMPLETED`)
- `400 Bad Request`: Identity validation failed (code: `VALIDATION_ERROR`)

**Implementation Notes**:
- Changes status to `'completed'` and sets `completed_at`
- Validates response identity against survey's `identity_mode`:
  - `identified_only`: Response MUST have `respondent_user_id`
  - `anonymous_only`: Response MUST NOT have `respondent_user_id`
  - `mixed`: No constraint (already determined at start)
- Updates all answers if provided in request
- **Increments `SurveyCollector.response_count`** by 1 (CRITICAL for tracking)
- Audit: Response completion logged
- Access: Checks `respondent_user_id` matches user

---

## 4. GET /api/modules/responses/{responseId}/status

**Description**: Get current response status and metadata

**Access**: Private (authentication required)

**URL Parameters**:
- `responseId` (required): Response ID

**Success Response (200)**:
```json
{
  "ok": true,
  "data": {
    "id": 456,
    "surveyId": 123,
    "status": "completed",
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:45:00Z",
    "lastActivityAt": "2024-01-15T10:45:00Z",
    "answerCount": 12
  }
}
```

**Error Responses**:
- `400 Bad Request`: General error

**Implementation Notes**:
- Returns lifecycle metadata
- Useful for frontend to display progress
- No side effects (read-only)

---

## 5. GET /api/modules/surveys/{surveyId}/responses/stats

**Description**: Get survey response statistics with auto-cleanup of abandoned responses

**Access**: Private (creator/admin only)

**URL Parameters**:
- `surveyId` (required): Survey ID

**Query Parameters**:
- `timeout` (optional): Minutes before marking as abandoned (default: 1440/24h)

**Success Response (200)**:
```json
{
  "ok": true,
  "data": {
    "surveyId": 123,
    "total": 100,
    "byStatus": {
      "started": 5,
      "completed": 85,
      "abandoned": 10
    },
    "completionRate": 85,
    "collectorStats": [
      {
        "collectorId": 201,
        "collectorName": "Email Campaign 1",
        "collectorType": "email",
        "total": 45,
        "byStatus": {
          "started": 2,
          "completed": 40,
          "abandoned": 3
        },
        "completionRate": 89
      },
      {
        "collectorId": 202,
        "collectorName": "Public Link",
        "collectorType": "web_link",
        "total": 55,
        "byStatus": {
          "started": 3,
          "completed": 45,
          "abandoned": 7
        },
        "completionRate": 82
      }
    ]
  }
}
```

**Error Responses**:
- `404 Not Found`: Survey not found (code: `SURVEY_NOT_FOUND`)
- `403 Forbidden`: Access denied (code: `ACCESS_DENIED`)

**Implementation Notes**:
- **Auto-cleanup**: Calls `markAbandonedResponses()` before calculating stats
- Marks responses with `status='started'` and `last_activity_at` older than timeout as `'abandoned'`
- Lazy operation (called on demand, not cron) to reduce DB load
- Default timeout: 1440 minutes (24 hours)
- Breaks down stats by collector for multi-source analysis
- Calculation: `completionRate = (completed / total) * 100`
- Access: Only survey creator or admin can view

---

## 6. POST /api/modules/responses/{responseId}/abandon

**Description**: Mark response as abandoned (user leaving without submitting)

**Access**: Public/Private

**Request Body**: Empty

**Success Response (200)**:
```json
{
  "ok": true,
  "message": "Response marked as abandoned",
  "data": {
    "responseId": 456,
    "status": "abandoned"
  }
}
```

**Error Responses**:
- `400 Bad Request`: General error

**Implementation Notes**:
- Only marks if status is NOT already `'completed'`
- Called when user navigates away or times out
- Helps identify drop-off points
- Can be called from frontend beforeunload event

---

## Response Payload Format

### Answer Object
```json
{
  "question_id": 101,
  "option_id": 205,           // Multiple choice/dropdown
  "answer_text": "Text answer", // Short/long text
  "value_number": 42,         // Numeric/rating
  "value_json": {             // Complex types (matrix, ranking, etc.)
    "row_id": 1,
    "column_id": 2,
    "score": 5
  }
}
```

---

## Migration & Database Changes

Run migrations 012-015 to add:
1. **SurveyResponse** fields:
   - `status` ENUM('started', 'completed', 'abandoned') DEFAULT 'started'
   - `started_at` DATETIME
   - `completed_at` DATETIME (nullable)
   - `last_activity_at` DATETIME

2. **SurveyCollector** fields:
   - `response_count` INT DEFAULT 0 (fixed from bug)

3. **New Tables**:
   - `collector_permissions` (for invitation workflow)
   - `audit_logs` (for compliance tracking)

---

## Frontend Integration Example

### React Hook Pattern
```javascript
const useResponseLifecycle = (surveyId, collectorToken) => {
  const [responseId, setResponseId] = useState(null);
  const [status, setStatus] = useState('idle');

  const startResponse = async (sessionId) => {
    const { data } = await api.post('/responses/start', {
      surveyId,
      collectorToken,
      sessionId
    });
    setResponseId(data.data.responseId);
    setStatus('started');
  };

  const saveAnswers = async (answers) => {
    await api.put(`/responses/${responseId}/save`, { answers });
    // Auto-save every X seconds
  };

  const completeResponse = async (finalAnswers) => {
    await api.post(`/responses/${responseId}/complete`, {
      answers: finalAnswers
    });
    setStatus('completed');
  };

  const abandonResponse = async () => {
    await api.post(`/responses/${responseId}/abandon`);
    setStatus('abandoned');
  };

  return { responseId, status, startResponse, saveAnswers, completeResponse, abandonResponse };
};

// Usage
function SurveyForm() {
  const { startResponse, saveAnswers, completeResponse } = useResponseLifecycle(123, 'token_abc');

  useEffect(() => {
    startResponse(sessionStorage.getItem('sessionId'));
  }, []);

  const handleAutoSave = debounce((answers) => {
    saveAnswers(answers);
  }, 5000); // Save every 5 seconds

  const handleSubmit = async (finalAnswers) => {
    await completeResponse(finalAnswers);
  };

  return (/* form JSX */);
}
```

---

## Error Codes Reference

| Code | Status | Meaning |
|------|--------|---------|
| `SURVEY_NOT_FOUND` | 404 | Survey doesn't exist |
| `COLLECTOR_INACTIVE` | 400 | Collector is no longer active |
| `RESPONSE_NOT_FOUND` | 404 | Response doesn't exist |
| `RESPONSE_COMPLETED` | 400 | Can't modify completed response |
| `RESPONSE_ALREADY_COMPLETED` | 400 | Response already submitted |
| `VALIDATION_ERROR` | 400 | Identity mode conflict |
| `ACCESS_DENIED` | 403 | User not authorized |
| `IDENTITY_REQUIRED` | 400 | Survey requires identified response |

---

## Status Transitions

```
[Idle]
  ↓ (POST /start)
[Started] ←→ Auto-save loop (PUT /save)
  ↓ (POST /complete)
[Completed] ✓ Final state
  
[Started]
  ↓ (POST /abandon or timeout)
[Abandoned] ✓ Final state (cleanup target)
```

---

## Performance Notes

1. **Auto-save**: Frontend should debounce save requests (5-10 second intervals)
2. **Stats calculation**: Uses aggregation, not full scan. Lazy cleanup on demand.
3. **Collector counter**: Incremented in single query (atomic operation)
4. **Abandoned cleanup**: Runs at stats request time only, not continuously

---

## Related Services

- `response.lifecycle.service.js`: Status workflow logic
- `survey.validation.service.js`: Identity and config validation
- `survey.access.service.js`: Permission decisions
- `collector.service.js`: Collector access verification
- `audit.service.js`: Audit trail logging


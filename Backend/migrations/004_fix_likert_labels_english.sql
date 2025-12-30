-- Migration: Fix Likert scale labels to English
-- Purpose: Replace corrupted/Vietnamese Likert labels with clean English labels
-- Date: 2025-11-08

-- Update all Likert scale question options to English
-- Assumes questions with question_type_id = 3 are Likert scale questions

UPDATE question_options qo
INNER JOIN questions q ON qo.question_id = q.id
SET qo.option_text = CASE qo.display_order
    WHEN 1 THEN '1 - Strongly disagree'
    WHEN 2 THEN '2 - Disagree'
    WHEN 3 THEN '3 - Neutral'
    WHEN 4 THEN '4 - Agree'
    WHEN 5 THEN '5 - Strongly agree'
    ELSE qo.option_text
END
WHERE q.question_type_id = 3
  AND qo.display_order BETWEEN 1 AND 5;

-- Verify the update
SELECT 
    q.id AS question_id,
    q.question_text,
    qo.option_text,
    qo.display_order
FROM questions q
INNER JOIN question_options qo ON q.id = qo.question_id
WHERE q.question_type_id = 3
ORDER BY q.id, qo.display_order;

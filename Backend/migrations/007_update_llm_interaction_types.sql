-- Migration: Update LLM interaction types to include new values
-- File: 007_update_llm_interaction_types.sql

-- Update the ENUM type to include the new interaction types
ALTER TABLE llm_interactions 
MODIFY COLUMN interaction_type ENUM(
  'survey_generation', 
  'analysis', 
  'summary', 
  'recommendation', 
  'question_generation', 
  'category_prediction'
) NOT NULL;

-- Add comment to track this change
ALTER TABLE llm_interactions COMMENT = 'Updated interaction_type ENUM to support Hugging Face API functions - Migration 007';
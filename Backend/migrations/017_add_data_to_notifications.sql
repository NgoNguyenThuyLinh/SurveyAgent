-- Migration 017: Add data column to notifications table for storing action metadata (tokens, etc)
-- Date: 2025-11-22

ALTER TABLE notifications ADD COLUMN `data` JSON NULL DEFAULT NULL AFTER `related_id`;

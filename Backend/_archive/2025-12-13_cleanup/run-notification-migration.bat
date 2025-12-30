@echo off
REM Run notification migration
mysql -h localhost -P 3307 -u llm_survey_user -p123456 llm_survey_db < migrations\update-notifications-columns.sql
echo Migration completed!
pause

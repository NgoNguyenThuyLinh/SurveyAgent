/**
 * Cleanup abandoned responses (status='started' for more than 24 hours)
 * Run this periodically via cron job or server scheduler
 */

const { sequelize } = require('../src/config/database');
const { SurveyResponse, Answer } = require('../src/models');
const logger = require('../src/utils/logger');

async function cleanupAbandonedResponses() {
  try {
    logger.info('[CleanupService] Starting cleanup of abandoned responses...');

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find responses that are 'started' and haven't been updated in 24 hours
    const abandonedResponses = await SurveyResponse.findAll({
      where: {
        status: 'started',
        last_activity_at: {
          [sequelize.Sequelize.Op.lt]: twentyFourHoursAgo
        }
      }
    });

    if (abandonedResponses.length === 0) {
      logger.info('[CleanupService] No abandoned responses to cleanup');
      return { cleaned: 0 };
    }

    logger.info(`[CleanupService] Found ${abandonedResponses.length} abandoned responses to cleanup`);

    // Delete answers associated with these responses
    const responseIds = abandonedResponses.map(r => r.id);
    
    const answersDeleted = await Answer.destroy({
      where: {
        survey_response_id: sequelize.Sequelize.Op.in(responseIds)
      }
    });

    logger.info(`[CleanupService] Deleted ${answersDeleted} answers`);

    // Delete the responses
    const responsesDeleted = await SurveyResponse.destroy({
      where: {
        id: sequelize.Sequelize.Op.in(responseIds)
      }
    });

    logger.info(`[CleanupService] Deleted ${responsesDeleted} abandoned responses`);

    return { 
      cleaned: responsesDeleted,
      answersRemoved: answersDeleted
    };
  } catch (error) {
    logger.error('[CleanupService] Cleanup failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  cleanupAbandonedResponses()
    .then(result => {
      console.log('Cleanup completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupAbandonedResponses };

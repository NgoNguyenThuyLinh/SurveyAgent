// src/utils/audit.service.js
// Service to handle audit logging for system changes

const { AuditLog } = require('../models');
const logger = require('./logger');

class AuditService {
  /**
   * Log an action to the audit trail
   * @param {Object} options - Audit log options
   * @param {string} options.entityType - Type of entity (survey, collector, response, user)
   * @param {number} options.entityId - ID of the entity
   * @param {string} options.action - Action performed (created, updated, deleted, soft_deleted)
   * @param {number} options.performedBy - User ID who performed the action
   * @param {Object} options.oldValues - Previous state (optional)
   * @param {Object} options.newValues - New state (optional)
   * @param {string} options.description - Human readable description (optional)
   * @param {string} options.ipAddress - IP address of client (optional)
   * @param {string} options.userAgent - User agent string (optional)
   */
  async log({
    entityType,
    entityId,
    action,
    performedBy,
    oldValues = null,
    newValues = null,
    description = null,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const auditEntry = await AuditLog.create({
        entity_type: entityType,
        entity_id: entityId,
        action,
        performed_by: performedBy,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        description,
        ip_address: ipAddress,
        user_agent: userAgent
      });

      logger.info(`[AUDIT] ${action} ${entityType}#${entityId} by user ${performedBy}`);
      return auditEntry;
    } catch (error) {
      // Don't throw - audit log failure shouldn't break the main operation
      logger.error(`[AUDIT ERROR] Failed to log audit entry:`, error.message);
      return null;
    }
  }

  /**
   * Get audit logs for an entity
   */
  async getEntityAuditTrail(entityType, entityId, limit = 50) {
    try {
      const logs = await AuditLog.findAll({
        where: {
          entity_type: entityType,
          entity_id: entityId
        },
        order: [['created_at', 'DESC']],
        limit,
        include: [
          {
            model: require('../models').User,
            attributes: ['id', 'email', 'username'],
            foreignKey: 'performed_by'
          }
        ]
      });

      return logs;
    } catch (error) {
      logger.error(`[AUDIT] Failed to retrieve audit trail:`, error.message);
      return [];
    }
  }

  /**
   * Get audit logs for a user's actions
   */
  async getUserAuditTrail(userId, limit = 100) {
    try {
      const logs = await AuditLog.findAll({
        where: { performed_by: userId },
        order: [['created_at', 'DESC']],
        limit
      });

      return logs;
    } catch (error) {
      logger.error(`[AUDIT] Failed to retrieve user audit trail:`, error.message);
      return [];
    }
  }

  /**
   * Helper to extract changed fields between old and new values
   */
  getChangedFields(oldValues, newValues) {
    if (!oldValues || !newValues) return null;

    const changed = {};
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changed[key] = {
          old: oldValues[key],
          new: newValues[key]
        };
      }
    }

    return Object.keys(changed).length > 0 ? changed : null;
  }
}

module.exports = new AuditService();

// src/modules/surveys/controller/surveyInvite.controller.js
const surveyInviteService = require('../service/surveyInvite.service');
const notificationService = require('../../notifications/service/notification.service');
const { User } = require('../../../models');
const logger = require('../../../utils/logger');

class SurveyInviteController {
    /**
     * Create invites for a survey
     * POST /api/modules/surveys/:id/invites
     */
    async createInvites(req, res) {
        try {
            const { id: surveyId } = req.params;
            const { emails } = req.body;

            if (!emails || !Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email list is required'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));
            if (invalidEmails.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid email format: ${invalidEmails.join(', ')}`
                });
            }

            // Create invites
            const invites = await surveyInviteService.createInvites(
                surveyId,
                emails,
                req.user.id
            );

            // Send notifications to invited users
            for (const invite of invites) {
                // Find user by email (if they have an account)
                const user = await User.findOne({ where: { email: invite.email } });

                if (user) {
                    // Get or create a collector for this survey
                    const { SurveyCollector } = require('../../../models');
                    let collector = await SurveyCollector.findOne({
                        where: { survey_id: surveyId, is_active: true }
                    });

                    if (!collector) {
                        // Create a default collector if none exists
                        const crypto = require('crypto');
                        collector = await SurveyCollector.create({
                            survey_id: surveyId,
                            name: 'Default Collector',
                            type: 'web_link',
                            token: crypto.randomBytes(16).toString('hex'),
                            is_active: true,
                            created_by: req.user.id
                        });
                    }

                    // Create notification for registered users
                    await notificationService.createNotification({
                        user_id: user.id,
                        type: 'survey_invitation',
                        title: 'Survey Invitation',
                        message: `You have been invited to participate in a survey`,
                        related_type: 'survey',
                        related_id: surveyId,
                        data: {
                            invite_token: invite.token,
                            survey_id: surveyId,
                            collector_token: collector.token,
                            action_url: `/invitation/${invite.token}`
                        }
                    });
                }
                // Note: For non-registered users, you would send email here
                // This requires email service integration
            }

            res.status(201).json({
                success: true,
                message: `${invites.length} invites created successfully`,
                data: {
                    invites: invites.map(inv => ({
                        id: inv.id,
                        email: inv.email,
                        status: inv.status,
                        expires_at: inv.expires_at
                    }))
                }
            });
        } catch (error) {
            logger.error('Create invites error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error creating invites'
            });
        }
    }

    /**
     * Get all invites for a survey
     * GET /api/modules/surveys/:id/invites
     */
    async getInvites(req, res) {
        try {
            const { id: surveyId } = req.params;
            const invites = await surveyInviteService.getInvitesBySurvey(surveyId, req.user.id);

            res.status(200).json({
                success: true,
                data: { invites }
            });
        } catch (error) {
            logger.error('Get invites error:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Access denied')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching invites'
            });
        }
    }

    /**
     * Validate invite token (public endpoint)
     * GET /api/modules/invites/:token/validate
     */
    async validateInvite(req, res) {
        try {
            const { token } = req.params;
            logger.info(`Validating invite token: ${token}`);
            const invite = await surveyInviteService.validateInvite(token);

            res.status(200).json({
                success: true,
                data: {
                    valid: true,
                    survey: invite.survey,
                    email: invite.email
                }
            });
        } catch (error) {
            logger.error(`Validate invite error for token ${req.params.token}:`, error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Invalid invite token',
                data: { valid: false }
            });
        }
    }

    /**
     * Accept invite and get collector URL
     * POST /api/modules/invites/:token/accept
     */
    async acceptInvite(req, res) {
        try {
            const { token } = req.params;
            const invite = await surveyInviteService.validateInvite(token);

            // Get active collector
            const { SurveyCollector } = require('../../../models');
            const collector = await SurveyCollector.findOne({
                where: { survey_id: invite.survey_id, is_active: true }
            });

            if (!collector) {
                // If no collector, creating one on the fly might be risky for concurrency, 
                // but essential if not created during invite.
                // Reusing createInvites logic or assuming one exists. 
                // For now, fail if not found (should be found since createInvites ensures it).
                throw new Error('No active collector found to accept this invitation.');
            }

            // Return the redirect URL (frontend should handle the redirect)
            // We append the invite_token to track the response later
            res.status(200).json({
                success: true,
                data: {
                    redirect_url: `/public/response/${collector.token}?invite_token=${token}`
                }
            });
        } catch (error) {
            logger.error('Accept invite error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to accept invitation'
            });
        }
    }

    /**
     * Revoke/delete invite
     * DELETE /api/modules/invites/:id
     */
    async revokeInvite(req, res) {
        try {
            const { id } = req.params;
            await surveyInviteService.revokeInvite(id, req.user.id);

            res.status(200).json({
                success: true,
                message: 'Invite revoked successfully'
            });
        } catch (error) {
            logger.error('Revoke invite error:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Access denied')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Error revoking invite'
            });
        }
    }

    /**
     * Get invite statistics
     * GET /api/modules/surveys/:id/invites/stats
     */
    async getInviteStats(req, res) {
        try {
            const { id: surveyId } = req.params;
            const stats = await surveyInviteService.getInviteStats(surveyId, req.user.id);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Get invite stats error:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Access denied')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching invite stats'
            });
        }
    }
}

module.exports = new SurveyInviteController();

// src/modules/surveys/service/survey.service.js
const { Survey, User, SurveyTemplate, SurveyResponse, Question, QuestionOption, SurveyAccess, SurveyInvite, Workspace, WorkspaceMember } = require('../../../models');
const { Op } = require('sequelize');
const surveyAccessService = require('./surveyAccess.service');

class SurveyService {
  /**
   * Get all surveys with filters and pagination
   */
  async getAllSurveys(options = {}, user) {
    const {
      page = 1,
      limit = 10,
      status,
      target_audience,
      search
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Role-based filtering
    if (user.role !== 'admin') {
      where.created_by = user.id;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Target audience filter
    if (target_audience) {
      where.target_audience = target_audience;
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { sequelize } = require('../../../models'); // Ensure sequelize is available

    const { count, rows } = await Survey.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM survey_responses AS sr
              WHERE sr.survey_id = Survey.id
            )`),
            'responseCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM survey_responses AS sr
              WHERE sr.survey_id = Survey.id
              AND sr.respondent_id = '${user.id}'
            )`),
            'my_response_count'
          ]
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'full_name', 'email']
        },
        {
          model: SurveyTemplate,
          as: 'template',
          attributes: ['id', 'title', 'description'],
          include: [
            {
              model: Question,
              as: 'Questions',
              attributes: ['id']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      distinct: true // Important for correct count with includes
    });

    // Map surveys to include questionCount (responseCount and my_response_count are already in attributes)
    const surveysWithCount = rows.map(survey => {
      const surveyData = survey.toJSON();
      const templateQuestions = surveyData.template?.Questions || [];
      surveyData.questionCount = templateQuestions.length;

      // Ensure counts are numbers (sequelize literals sometimes return strings)
      surveyData.responseCount = parseInt(survey.getDataValue('responseCount') || 0);
      surveyData.my_response_count = parseInt(survey.getDataValue('my_response_count') || 0);

      delete surveyData.SurveyResponses; // Clean up just in case
      return surveyData;
    });

    return {
      surveys: surveysWithCount,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get survey by ID with access control
   */
  async getSurveyById(surveyId, user) {
    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: SurveyTemplate,
          as: 'template',
          attributes: ['id', 'title'],
          include: [
            {
              model: Question,
              as: 'Questions',
              attributes: ['id', 'question_text', 'question_type_id', 'display_order', 'required', 'label'],
              include: [
                {
                  model: QuestionOption,
                  as: 'QuestionOptions', // Ensure alias matches model definition if any
                  attributes: ['id', 'option_text', 'display_order']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check access permissions
    if (user.role === 'admin') {
      // Admin has access to all surveys
      return survey;
    } else if (survey.created_by === user.id) {
      // Creator has full access
      return survey;
    } else {
      // Check if user has been granted access
      const hasAccess = await surveyAccessService.hasAccess(surveyId, user.id, 'view');
      if (!hasAccess) {
        throw new Error('Access denied to this survey');
      }
      return survey;
    }
  }

  /**
   * Create new survey
   */
  async createSurvey(surveyData, user) {
    const {
      template_id,
      title,
      description,
      start_date,
      end_date,
      target_audience,
      target_value,
      // Simple Access Control fields
      access_type = 'public',
      require_login = false,
      allow_anonymous = true,
      workspace_id = null
    } = surveyData;

    // Verify template exists
    const template = await SurveyTemplate.findByPk(template_id);
    if (!template) {
      throw new Error('Survey template not found');
    }

    // Validate workspace access if internal type
    if (access_type === 'internal' && workspace_id) {
      const workspace = await Workspace.findByPk(workspace_id);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // Check if user is member of the workspace
      const membership = await WorkspaceMember.findOne({
        where: { workspace_id, user_id: user.id }
      });
      if (!membership) {
        throw new Error('You are not a member of this workspace');
      }

      // Enforce Role >= Collaborator (owner or collaborator)
      if (membership.role !== 'owner' && membership.role !== 'collaborator') {
        throw new Error('Access denied. Only workspace owners and collaborators can create surveys.');
      }
    }

    const survey = await Survey.create({
      template_id,
      title,
      description,
      start_date,
      end_date,
      target_audience: target_audience || 'all_users',
      target_value,
      created_by: user.id,
      status: 'draft',
      // Simple Access Control
      access_type,
      require_login,
      allow_anonymous,
      workspace_id: access_type === 'internal' ? workspace_id : null
    });

    return this.getSurveyById(survey.id, user);
  }

  /**
   * Update survey
   */
  async updateSurvey(surveyId, updateData, user) {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership or workspace permission
    if (user.role !== 'admin') {
      if (survey.workspace_id) {
        // Workspace Survey: Check workspace permissions
        const membership = await WorkspaceMember.findOne({
          where: { workspace_id: survey.workspace_id, user_id: user.id }
        });

        if (!membership) {
          throw new Error('Access denied. You are not a member of the workspace where this survey resides.');
        }

        if (membership.role !== 'owner' && membership.role !== 'collaborator') {
          throw new Error('Access denied. Only workspace owners and collaborators can edit surveys.');
        }
      } else if (survey.created_by !== user.id) {
        // Personal Survey: Check creator
        throw new Error('Access denied. You do not own this survey.');
      }
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'start_date',
      'end_date',
      'target_audience',
      'target_value',
      'status',
      // Simple Access Control
      'access_type',
      'require_login',
      'allow_anonymous',
      'workspace_id'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        survey[field] = updateData[field];
      }
    });

    await survey.save();

    return this.getSurveyById(surveyId, user);
  }

  /**
   * Delete survey
   */
  async deleteSurvey(surveyId, user) {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (user.role !== 'admin' && survey.created_by !== user.id) {
      throw new Error('Access denied. You do not own this survey.');
    }

    await survey.destroy();

    return { message: 'Survey deleted successfully' };
  }

  /**
   * Bulk delete surveys
   */
  async deleteSurveys(surveyIds, user) {
    if (!Array.isArray(surveyIds) || surveyIds.length === 0) {
      throw new Error('No survey IDs provided');
    }

    const where = {
      id: { [Op.in]: surveyIds }
    };

    // If not admin, restrict to own surveys
    if (user.role !== 'admin') {
      where.created_by = user.id;
    }

    const count = await Survey.count({ where });

    if (count === 0) {
      throw new Error('No surveys found or access denied');
    }

    await Survey.destroy({ where });

    return { message: `${count} surveys deleted successfully` };
  }

  /**
   * Get survey statistics
   */
  async getSurveyStats(surveyId, user) {
    const survey = await this.getSurveyById(surveyId, user);

    if (!survey) {
      throw new Error('Survey not found');
    }

    const responseCount = await SurveyResponse.count({
      where: { survey_id: surveyId }
    });

    return {
      survey_id: surveyId,
      title: survey.title,
      status: survey.status,
      response_count: responseCount,
      start_date: survey.start_date,
      end_date: survey.end_date,
      target_audience: survey.target_audience
    };
  }

  /**
   * Publish survey (change status from draft to active)
   */
  async publishSurvey(surveyId, user) {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (user.role !== 'admin' && survey.created_by !== user.id) {
      throw new Error('Access denied. You do not own this survey.');
    }

    // Validate status transition
    if (survey.status !== 'draft') {
      throw new Error(`Cannot publish survey. Current status: ${survey.status}. Only draft surveys can be published.`);
    }

    // Validate dates
    const now = new Date();
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    if (endDate <= now) {
      throw new Error('End date must be in the future');
    }

    // Update status to active
    survey.status = 'active';
    await survey.save();

    return this.getSurveyById(surveyId, user);
  }

  /**
   * Close survey (change status from active to closed)
   */
  async closeSurvey(surveyId, user) {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (user.role !== 'admin' && survey.created_by !== user.id) {
      throw new Error('Access denied. You do not own this survey.');
    }

    // Validate status transition
    if (survey.status !== 'active') {
      throw new Error(`Cannot close survey. Current status: ${survey.status}. Only active surveys can be closed.`);
    }

    // Update status to closed
    survey.status = 'closed';
    await survey.save();

    return this.getSurveyById(surveyId, user);
  }

  /**
   * Update survey status (flexible status change with validation)
   */
  async updateSurveyStatus(surveyId, newStatus, user) {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check ownership
    if (user.role !== 'admin' && survey.created_by !== user.id) {
      throw new Error('Access denied. You do not own this survey.');
    }

    const validStatuses = ['draft', 'active', 'closed', 'analyzed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Valid statuses: ${validStatuses.join(', ')}`);
    }

    // Validate status transitions
    const currentStatus = survey.status;

    // Define valid transitions
    const validTransitions = {
      draft: ['active'],
      active: ['closed'],
      closed: ['analyzed'],
      analyzed: [] // Final state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}. Valid next states: ${validTransitions[currentStatus].join(', ') || 'none (final state)'}`);
    }

    // Update status
    survey.status = newStatus;
    await survey.save();

    return this.getSurveyById(surveyId, user);
  }

  /**
   * Auto-close expired surveys (for cron job)
   */
  async autoCloseExpiredSurveys() {
    const now = new Date();

    // Find all active surveys past their end_date
    const expiredSurveys = await Survey.findAll({
      where: {
        status: 'active',
        end_date: { [Op.lt]: now }
      }
    });

    // Close each expired survey
    const results = [];
    for (const survey of expiredSurveys) {
      survey.status = 'closed';
      await survey.save();
      results.push({
        survey_id: survey.id,
        title: survey.title,
        closed_at: new Date()
      });
    }

    return {
      closed_count: results.length,
      surveys: results
    };
  }
}

module.exports = new SurveyService();

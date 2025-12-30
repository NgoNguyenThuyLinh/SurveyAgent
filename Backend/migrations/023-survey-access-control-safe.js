'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if columns already exist before adding
      const surveysTable = await queryInterface.describeTable('surveys');
      
      if (!surveysTable.access_type) {
        await queryInterface.addColumn('surveys', 'access_type', {
          type: Sequelize.ENUM('public', 'public_with_login', 'private', 'internal'),
          allowNull: false,
          defaultValue: 'public',
          comment: 'Access control: public (anonymous), public_with_login, private (invite only), internal (workspace members)'
        });
      }

      if (!surveysTable.require_login) {
        await queryInterface.addColumn('surveys', 'require_login', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether login is required to respond'
        });
      }

      if (!surveysTable.allow_anonymous) {
        await queryInterface.addColumn('surveys', 'allow_anonymous', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Whether anonymous responses are allowed'
        });
      }

      // Check survey_responses table
      const responsesTable = await queryInterface.describeTable('survey_responses');
      
      if (!responsesTable.is_anonymous) {
        await queryInterface.addColumn('survey_responses', 'is_anonymous', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Whether this response is anonymous'
        });
      }

      if (!responsesTable.respondent_email) {
        await queryInterface.addColumn('survey_responses', 'respondent_email', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Email of identified respondent'
        });
      }

      if (!responsesTable.respondent_name) {
        await queryInterface.addColumn('survey_responses', 'respondent_name', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Name of identified respondent'
        });
      }

      // Check if survey_invites table exists
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('survey_invites')) {
        await queryInterface.createTable('survey_invites', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          survey_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'surveys',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          token: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          status: {
            type: Sequelize.ENUM('pending', 'responded', 'expired'),
            allowNull: false,
            defaultValue: 'pending',
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          responded_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          }
        });

        // Add indexes
        await queryInterface.addIndex('survey_invites', ['survey_id']);
        await queryInterface.addIndex('survey_invites', ['email']);
        await queryInterface.addIndex('survey_invites', ['token']);
      }
    } catch (error) {
      console.log('Error during migration:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop table and columns in reverse order
    await queryInterface.dropTable('survey_invites');
    
    await queryInterface.removeColumn('survey_responses', 'respondent_name');
    await queryInterface.removeColumn('survey_responses', 'respondent_email');
    await queryInterface.removeColumn('survey_responses', 'is_anonymous');

    await queryInterface.removeColumn('surveys', 'allow_anonymous');
    await queryInterface.removeColumn('surveys', 'require_login');
    await queryInterface.removeColumn('surveys', 'access_type');

    // Drop ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_surveys_access_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_survey_invites_status"');
  }
};
// src/pages/LLM/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import TextArea from '../../components/UI/TextArea';
import Loader from '../../components/common/Loader/Loader';
import { useToast } from '../../contexts/ToastContext';
import LLMService from '../../api/services/llm.service';
import SurveyCreator from '../../components/LLM/SurveyCreator';
import SurveyActions from '../../components/LLM/SurveyActions';
import WorkspaceService from '../../api/services/workspace.service';
import Modal from '../../components/UI/Modal'; // Assuming exists
import SurveyQuestionEditor from '../../components/LLM/SurveyQuestionEditor';
import styles from './LLM.module.scss';

const LLM = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [formData, setFormData] = useState({
    keyword: '',
    category: '',
    questionCount: 5,
    prompt: ''
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  // const [categories, setCategories] = useState([]); // Unused
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [createdSurvey, setCreatedSurvey] = useState(null);
  const [editingSurveyId, setEditingSurveyId] = useState(null);

  // Workspace & Target Audience State
  const [workspaces, setWorkspaces] = useState([]);
  const [targetAudience, setTargetAudience] = useState('all_users'); // 'all_users' (public) or 'internal'
  const [targetWorkspace, setTargetWorkspace] = useState('');
  const [showManageMembers, setShowManageMembers] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      // Load prompts (categories not currently used)
      const promptsRes = await LLMService.getLlmPrompts();
      setPrompts(promptsRes.data.prompts || []);

      // Load Workspaces for Internal Target
      const workspaceRes = await WorkspaceService.getMyWorkspaces();
      if (workspaceRes.ok) {
        // Filter workspaces where user has role >= Collaborator
        const validWorkspaces = workspaceRes.items.filter(ws =>
          ['owner', 'collaborator', 'admin'].includes(ws.role || ws.currentUserRole) // Adjust property name if needed
        );
        setWorkspaces(validWorkspaces);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Error while loading initial data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateQuestions = async () => {
    if (!formData.keyword.trim()) {
      showToast('Please enter a keyword or topic', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Generating questions with:', formData);

      const response = await LLMService.generateQuestions({
        topic: formData.keyword,
        count: parseInt(formData.questionCount) || 5,
        category: formData.category || 'general'
      });

      console.log('Full Response:', response);

      // Backend returns: {success: true, data: {questions: [...], metadata: {...}}}
      const questions = response.data?.questions || response.questions || [];

      console.log('Questions extracted:', questions);
      console.log('Questions count:', questions.length);

      if (questions.length === 0) {
        showToast('No questions generated. Please try again.', 'warning');
        return;
      }

      setGeneratedQuestions(questions);
      showToast(`Generated ${questions.length} questions successfully!`, 'success');
    } catch (error) {
      console.error('Error generating questions:', error);
      console.error('Error response:', error.response);
      showToast(
        'Error while generating questions: ' +
        (error.response?.data?.message || error.message),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePredictCategory = async () => {
    if (!formData.keyword.trim()) {
      showToast('Please enter a keyword', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await LLMService.predictCategory({
        keyword: formData.keyword
      });

      if (response.data.category) {
        setFormData(prev => ({
          ...prev,
          category: response.data.category
        }));
        showToast(
          `Predicted category: ${response.data.category} (${response.data.confidence}%)`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error predicting category:', error);
      showToast('Error while predicting category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSurvey = async () => {
    if (!formData.prompt.trim() && !selectedPrompt) {
      showToast('Please enter a prompt or select an existing one', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await LLMService.generateSurvey({
        prompt: formData.prompt,
        prompt_id: selectedPrompt,
        description: 'Generated by AI',
        target_audience: 'General', // LLM might ignore this, but our survey creation needs it
        access_type: targetAudience === 'internal' ? 'internal' : 'public', // Custom field to pass to createSurvey
        workspace_id: targetAudience === 'internal' ? targetWorkspace : null,
        title: 'AI Generated Survey', // Provide a default or extract from prompt
        course_name: 'AI Course' // Legacy?
      });

      showToast('Survey generated successfully!', 'success');
      console.log('Generated survey:', response.data);
    } catch (error) {
      console.error('Error generating survey:', error);
      showToast(
        'Error while generating survey: ' +
        (error.response?.data?.message || error.message),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSurvey = (surveyId) => {
    setEditingSurveyId(surveyId);
    setActiveTab('edit');
  };

  const renderQuestionGeneration = () => (
    <div className={styles.tabContent}>
      <Card className={styles.formCard}>
        <h3>Generate Questions</h3>

        <div className={styles.formGroup}>
          <label>Keyword</label>
          <Input
            type="text"
            placeholder="Sales performance, AI adoption, customer feedback"
            value={formData.keyword}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
          />
          <p className={styles.helpText}>Enter a topic or keyword to define the context for AI-generated questions.</p>

          <div className={styles.predictWrapper}>
            <Button
              onClick={handlePredictCategory}
              disabled={loading || !formData.keyword.trim()}
              className={styles.predictBtn}
              variant="outline"
            >
              Predict Category
            </Button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Number of questions</label>
          <Select
            value={formData.questionCount}
            onChange={(value) => handleInputChange('questionCount', parseInt(value))}
          >
            <option value={3}>3 questions</option>
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
          </Select>
        </div>

        <Button
          onClick={handleGenerateQuestions}
          disabled={loading || !formData.keyword.trim()}
          className={styles.generateBtn}
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </Button>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card className={styles.resultsCard}>
          <h3>Generated Questions</h3>
          <div className={styles.questionsList}>
            {generatedQuestions.map((q, index) => (
              <div key={index} className={styles.questionItem}>
                <div className={styles.questionContent}>
                  <p className={styles.questionText}>{index + 1}. {q.question}</p>
                  <small className={styles.questionMeta}>
                    {q.type || 'Text'} • {q.category || 'General'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSurveyGeneration = () => (
    <div className={styles.tabContent}>
      <Card className={styles.formCard}>
        <h3>Generate Survey</h3>

        <div className={styles.formGroup}>
          <label>Select prompt</label>
          <Select
            value={selectedPrompt}
            onChange={(value) => setSelectedPrompt(value)}
            placeholder="Select prompt"
          >
            <option value="">Custom prompt</option>
            {prompts.map(prompt => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.prompt_name}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label>Custom prompt</label>
          <TextArea
            placeholder="Describe the survey you want to create..."
            value={formData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            rows={4}
            disabled={selectedPrompt}
            className={styles.textarea}
          />
          {selectedPrompt && (
            <p className={styles.helpText}>
              Using predefined prompt. Clear selection to type custom prompt.
            </p>
          )}
        </div>

        {/* Target Audience Section - Minimal Style */}
        <div className={styles.formGroup}>
          <label>Target Audience</label>
          <Select
            value={targetAudience}
            onChange={(val) => setTargetAudience(val)}
          >
            <option value="all_users">Public / All Users</option>
            <option value="internal">Internal Workspace</option>
          </Select>
        </div>

        {/* Workspace Selection */}
        {targetAudience === 'internal' && (
          <div className={styles.formGroup}>
            <label>Workspace</label>
            {workspaces.length > 0 ? (
              <div className={styles.workspaceSelector}>
                <Select
                  value={targetWorkspace}
                  onChange={(val) => setTargetWorkspace(val)}
                >
                  <option value="">-- Select Workspace --</option>
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <p className={styles.helpText} style={{ color: 'red' }}>
                No eligible workspaces found.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleGenerateSurvey}
          disabled={loading || (!formData.prompt.trim() && !selectedPrompt)}
          className={styles.generateBtn}
        >
          {loading ? 'Generating...' : 'Generate Survey'}
        </Button>
      </Card>
    </div>
  );

  if (loading && activeTab === 'generate' && generatedQuestions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>AI Question &amp; Survey Generator</h1>
          <p>Create smart questions and surveys with AI</p>
        </div>
        <div className={styles.loadingContainer}>
          <Loader />
          <p>Generating content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Question &amp; Survey Generator</h1>
        <p>Create smart questions and surveys with AI</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'generate' ? styles.active : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Questions
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'survey' ? styles.active : ''}`}
          onClick={() => setActiveTab('survey')}
          disabled={generatedQuestions.length === 0}
        >
          Generate Survey ({generatedQuestions.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'prompt' ? styles.active : ''}`}
          onClick={() => setActiveTab('prompt')}
        >
          Generate Survey from Prompt
        </button>
        {createdSurvey && (
          <button
            className={`${styles.tab} ${activeTab === 'result' ? styles.active : ''}`}
            onClick={() => setActiveTab('result')}
          >
            Survey Result
          </button>
        )}
        {createdSurvey && (
          <button
            className={`${styles.tab} ${activeTab === 'edit' ? styles.active : ''}`}
            onClick={() => {
              setEditingSurveyId(createdSurvey.id);
              setActiveTab('edit');
            }}
          >
            Edit Survey
          </button>
        )}
      </div>

      {activeTab === 'generate' && renderQuestionGeneration()}
      {activeTab === 'survey' && generatedQuestions.length > 0 && (
        <SurveyCreator
          generatedQuestions={generatedQuestions}
          onSurveyCreated={(survey) => {
            setCreatedSurvey(survey);
            setActiveTab('result');
          }}
        />
      )}
      {activeTab === 'prompt' && renderSurveyGeneration()}
      {activeTab === 'result' && createdSurvey && (
        <SurveyActions
          survey={createdSurvey}
          onClose={() => setActiveTab('generate')}
          onEditSurvey={handleEditSurvey}
        />
      )}
      {activeTab === 'edit' && editingSurveyId && (
        <SurveyQuestionEditor
          surveyId={editingSurveyId}
          onClose={() => setActiveTab('result')}
          onSurveyUpdated={() => {
            // Survey has been updated successfully
            showToast('Survey has been updated', 'success');
          }}
        />
      )}

      {showManageMembers && targetWorkspace && (
        <Modal
          isOpen={showManageMembers}
          onClose={() => setShowManageMembers(false)}
          title="Manage Workspace Members"
          size="lg"
        >
          <div style={{ padding: '20px' }}>
            <p>Redirecting to workspace management...</p>
            <Button onClick={() => window.open(`/workspaces/${targetWorkspace}/invitations`, '_blank')}>
              Go to Member Management
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LLM;

// Frontend/src/components/LLM/SurveyResults.jsx
import React, { useState, useEffect } from 'react';
import styles from './SurveyResults.module.scss';

const SurveyResults = ({ surveyId, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (surveyId) {
      fetchSurveyResults();
    }
  }, [surveyId]);

  const fetchSurveyResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/modules/llm/survey-responses/${surveyId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to load survey results');
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.message || 'Data loading error');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching survey results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.surveyResults}>
        <div className={styles.header}>
          <h2>Survey Results</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.surveyResults}>
        <div className={styles.header}>
          <h2>Survey Results</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.error}>
          <p>❌ {error}</p>
          <button onClick={fetchSurveyResults} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const renderAnalytics = () => (
    <div className={styles.analytics}>
      <div className={styles.summary}>
        <h3>Overview</h3>
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={styles.cardNumber}>{results.analytics.total_responses}</div>
            <div className={styles.cardLabel}>Total Responses</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardNumber}>{results.analytics.questions.length}</div>
            <div className={styles.cardLabel}>Number of Questions</div>
          </div>
        </div>
      </div>

      <div className={styles.questionAnalytics}>
        {results.analytics.questions.map((question, index) => (
          <div key={question.id} className={styles.questionResult}>
            <h4>Question {index + 1}: {question.text}</h4>
            <p className={styles.questionMeta}>
              Type: {question.type} | Total Answers: {question.total_answers}
            </p>

            {question.type === 'multiple_choice' && question.data.options && (
              <div className={styles.multipleChoiceResults}>
                {question.data.options.map((option) => (
                  <div key={option.id} className={styles.optionResult}>
                    <div className={styles.optionText}>{option.text}</div>
                    <div className={styles.optionStats}>
                      <div 
                        className={styles.progressBar}
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                      <span className={styles.optionCount}>
                        {option.count} ({option.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'yes_no' && question.data.yes_no && (
              <div className={styles.yesNoResults}>
                <div className={styles.optionResult}>
                  <div className={styles.optionText}>Yes</div>
                  <div className={styles.optionStats}>
                    <div 
                      className={styles.progressBar}
                      style={{ width: `${question.data.yes_no.yes.percentage}%` }}
                    ></div>
                    <span className={styles.optionCount}>
                      {question.data.yes_no.yes.count} ({question.data.yes_no.yes.percentage}%)
                    </span>
                  </div>
                </div>
                <div className={styles.optionResult}>
                  <div className={styles.optionText}>No</div>
                  <div className={styles.optionStats}>
                    <div 
                      className={styles.progressBar}
                      style={{ width: `${question.data.yes_no.no.percentage}%` }}
                    ></div>
                    <span className={styles.optionCount}>
                      {question.data.yes_no.no.count} ({question.data.yes_no.no.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {question.type === 'rating' && question.data.ratings && (
              <div className={styles.ratingResults}>
                <div className={styles.averageRating}>
                  <span className={styles.ratingLabel}>Average Score:</span>
                  <span className={styles.ratingValue}>{question.data.ratings.average}/5</span>
                </div>
                <div className={styles.ratingDistribution}>
                  {question.data.ratings.distribution.map((rating) => (
                    <div key={rating.rating} className={styles.ratingRow}>
                      <span className={styles.stars}>
                        {'★'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}
                      </span>
                      <div className={styles.ratingStats}>
                        <div 
                          className={styles.progressBar}
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                        <span className={styles.ratingCount}>
                          {rating.count} ({rating.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.type === 'text' && question.data.text_examples && (
              <div className={styles.textResults}>
                <h5>Sample Answers:</h5>
                {question.data.text_examples.map((text, idx) => (
                  <div key={idx} className={styles.textExample}>
                    "{text}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderResponses = () => (
    <div className={styles.responses}>
      <h3>Response List ({results.responses.length})</h3>
      {results.responses.map((response) => (
        <div key={response.id} className={styles.responseItem}>
          <div className={styles.responseHeader}>
            <span className={styles.responseId}>Response #{response.id}</span>
            <span className={styles.responseDate}>
              {new Date(response.submitted_at).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className={styles.responseAnswers}>
            {response.answers.map((answer, idx) => (
              <div key={idx} className={styles.answerItem}>
                <div className={styles.questionText}>{answer.question_text}</div>
                <div className={styles.answerText}>
                  {answer.answer_text || 'No answer provided'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.surveyResults}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>{results.survey.title}</h2>
          <p>{results.survey.description}</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'responses' ? styles.active : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Response Details
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'responses' && renderResponses()}
      </div>
    </div>
  );
};

export default SurveyResults;
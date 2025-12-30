import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponseService from '../../../api/services/response.service';
import Loader from '../../../components/common/Loader/Loader';
import Pagination from '../../../components/common/Pagination/Pagination';
import { useToast } from '../../../contexts/ToastContext';
import styles from './MyResponses.module.scss';

const MyResponses = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const itemsPerPage = 10;

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ResponseService.getMyResponses({
        limit: 100,
        page: 1
      });
      
      console.log('[MyResponses] fetchResponses result:', result);
      
      // Handle different response formats
      if (result && Array.isArray(result)) {
        setResponses(result);
      } else if (result?.ok && Array.isArray(result.responses)) {
        setResponses(result.responses);
      } else if (result?.ok && Array.isArray(result.data?.responses)) {
        setResponses(result.data.responses);
      } else if (result?.ok && Array.isArray(result.data)) {
        setResponses(result.data);
      } else if (Array.isArray(result?.items)) {
        setResponses(result.items);
      } else {
        console.warn('[MyResponses] Invalid response format:', result);
        setResponses([]);
      }
    } catch (error) {
      console.error('[MyResponses] Error fetching responses:', error);
      setResponses([]);
      showToast(error.message || 'Failed to fetch your responses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const filteredResponses = responses.filter((response) => {
    const surveyTitle = response.survey?.title || 'Unknown Survey';
    return surveyTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  const getIdentityDisplay = (response) => {
    if (response.respondent_user_id) {
      return '👤 Identified';
    }
    return '🔒 Anonymous';
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.myResponses}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Responses</h1>
          <p className={styles.subtitle}>View and manage your survey responses</p>
        </div>
        <button 
          className={styles.browseButton}
          onClick={() => navigate('/surveys')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Browse Surveys
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by survey name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <span className={styles.resultCount}>
          {filteredResponses.length} {filteredResponses.length === 1 ? 'response' : 'responses'} found
        </span>
      </div>

      {currentResponses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No responses yet</h3>
          <p>You haven't submitted any survey responses yet</p>
          <button 
            className={styles.emptyButton}
            onClick={() => navigate('/surveys')}
          >
            Find Surveys
          </button>
        </div>
      ) : (
        <>
          <div className={styles.responsesList}>
            {currentResponses.map((response) => (
              <div key={response.id} className={styles.responseCard}>
                <div 
                  className={styles.cardHeader}
                  onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedId(expandedId === response.id ? null : response.id);
                    }
                  }}
                >
                  <div className={styles.headerContent}>
                    <h3 className={styles.surveyTitle}>
                      {response.survey?.title || 'Unknown Survey'}
                    </h3>
                    <div className={styles.metadata}>
                      <span className={styles.date}>
                        📅 {new Date(response.created_at).toLocaleDateString()}
                      </span>
                      <span className={styles.identity}>
                        {getIdentityDisplay(response)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.expandIcon}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        transform: expandedId === response.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {expandedId === response.id && (
                  <div className={styles.cardContent}>
                    {response.answers && response.answers.length > 0 ? (
                      <div className={styles.answersSection}>
                        <h4>Answers</h4>
                        <div className={styles.answersList}>
                          {response.answers.map((answer, idx) => (
                            <div key={idx} className={styles.answerItem}>
                              <div className={styles.question}>
                                {answer.question?.question_text || `Question ${idx + 1}`}
                              </div>
                              <div className={styles.answer}>
                                {Array.isArray(answer.answer_value) 
                                  ? answer.answer_value.join(', ')
                                  : answer.answer_value || 'No answer provided'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className={styles.noAnswers}>No answers recorded for this response</p>
                    )}
                    
                    <div className={styles.responseFooter}>
                      <small>
                        Response ID: {response.id} • Status: {response.status}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyResponses;

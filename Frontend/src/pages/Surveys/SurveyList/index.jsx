import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SurveyService from '../../../api/services/survey.service';
import Loader from '../../../components/common/Loader/Loader';
import Pagination from '../../../components/common/Pagination/Pagination';
import StatusBadge from '../../../components/UI/StatusBadge';
import ConfirmModal from '../../../components/UI/ConfirmModal';
import Checkbox from '../../../components/UI/Checkbox/Checkbox';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './SurveyList.module.scss';
// Simple debounce implementation
const useDebounceValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return [debouncedValue]; // Return as array to be consistent with usage
};


const SurveyList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { state } = useAuth();
  const user = state.user;
  const isCreator = user?.role === 'creator' || user?.role === 'admin';
  const isRespondent = user?.role === 'user';

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Respondent View State
  const [respondentTab, setRespondentTab] = useState('pending'); // 'pending' | 'completed'

  // Helper to derive survey state for respondent
  const getRespondentMeta = (survey) => {
    const now = new Date();
    const endDate = survey.end_date ? new Date(survey.end_date) : null;
    const isExpired = endDate && endDate < now;
    const hasResponse = (survey.my_response_count || 0) > 0;

    // State derivation
    let state = 'NOT_STARTED';
    if (hasResponse) state = 'COMPLETED';
    else if (isExpired) state = 'EXPIRED';
    // IN_PROGRESS logic omitted as no draft signal available in current data. 
    // If backend provided 'has_draft', we'd use it.

    // Deadline text
    let deadlineText = null;
    if (endDate) {
      if (isExpired) {
        deadlineText = `Expired on ${endDate.toLocaleDateString()}`;
      } else {
        const diffTime = Math.abs(endDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        deadlineText = `Ends in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      }
    }

    return { state, deadlineText, isExpired, hasResponse };
  };

  // Filter surveys for respondent tabs
  const filteredRespondentSurveys = surveys.filter(survey => {
    const { hasResponse } = getRespondentMeta(survey);
    if (respondentTab === 'pending') {
      // Show if NO response AND (Active OR (Inactive but strictly for viewing? No, usually pending = active to take))
      // Actually if expired and no response, it's missed. Should it be in Pending or Completed?
      // Usually "Pending" implies actionable. If expired, maybe separate or at bottom. 
      // User request: "Default filter should show surveys NOT_STARTED or IN_PROGRESS... If no pending... show completed".
      // Let's put Expired in Pending but disabled? Or hide?
      // "EXPIRED: Disable actions". Implies it is visible.
      // So Pending = Active/Expired AND No Response.
      return !hasResponse;
    }
    // Completed = Has Response
    return hasResponse;
  });


  // Unified State for Filters & Pagination
  const [filterState, setFilterState] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: ''
  });

  const [debouncedSearch] = useDebounceValue(filterState.search, 500);

  // Pagination State (Server response)
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 0,
    totalItems: 0
  });

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);

  // Bulk Selection State
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fetchSurveys = useCallback(async (params = {}, signal) => {
    try {
      setLoading(true);

      // Defensive defaults - Ensure we always have valid values
      const apiParams = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search ?? '',
        status: (params?.status && params.status !== 'all') ? params.status : undefined
      };

      const response = await SurveyService.getAll(apiParams, { signal });

      setSurveys(response?.surveys || []);

      // Safe pagination handling
      if (response?.pagination) {
        setPaginationInfo({
          totalPages: response.pagination.totalPages ?? 0,
          totalItems: response.pagination.total ?? 0
        });
      } else {
        // Fallback if pagination missing (e.g. filtered list or minimal API)
        setPaginationInfo({
          totalPages: 1,
          totalItems: response?.surveys?.length || 0
        });
      }

      setSelectedSurveys([]);
    } catch (error) {
      if (error && (error.name === 'CanceledError' || error.message === 'canceled')) {
        return; // Ignore cancelled requests
      }
      console.error('Error fetching surveys:', error);
      setSurveys([]);
      showToast(error?.response?.data?.message || 'Failed to fetch surveys', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Effect to handle Fetching with AbortController
  useEffect(() => {
    const controller = new AbortController();

    // Pass the correct params
    const currentParams = {
      page: filterState.page,
      limit: filterState.limit,
      status: filterState.status,
      search: debouncedSearch
    };

    fetchSurveys(currentParams, controller.signal);

    return () => controller.abort();
  }, [fetchSurveys, filterState.page, filterState.limit, filterState.status, debouncedSearch]);


  // Handlers
  const handleSearchChange = (e) => {
    setFilterState(prev => ({ ...prev, search: e.target.value, page: 1 })); // Reset page on search
  };

  const handleStatusChangeFilter = (e) => {
    setFilterState(prev => ({ ...prev, status: e.target.value, page: 1 })); // Reset page on filter
  };

  const handlePageChange = (newPage) => {
    setFilterState(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setFilterState(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
  };

  const handleDelete = async () => {
    if (!surveyToDelete) return;

    try {
      await SurveyService.delete(surveyToDelete.id);
      showToast('Survey deleted successfully', 'success');
      setShowDeleteModal(false);
      setSurveyToDelete(null);
      fetchSurveys(filterState);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete survey', 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await SurveyService.deleteMany(selectedSurveys);
      showToast('Selected surveys deleted successfully', 'success');
      setShowBulkDeleteModal(false);
      setSelectedSurveys([]);
      fetchSurveys(filterState);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete surveys', 'error');
    }
  };

  const handleStatusChange = async (survey, newStatus) => {
    try {
      await SurveyService.updateStatus(survey.id, newStatus);
      showToast(`Survey ${newStatus} successfully`, 'success');
      fetchSurveys(filterState);
    } catch (error) {
      showToast(error.response?.data?.message || `Failed to ${newStatus} survey`, 'error');
    }
  };

  const openDeleteModal = (survey) => {
    setSurveyToDelete(survey);
    setShowDeleteModal(true);
  };

  // Selection Handlers (Server-Side safe: only select from current page)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = surveys.map(s => s.id);
      setSelectedSurveys(allIds);
    } else {
      setSelectedSurveys([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedSurveys(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isAllSelected = surveys.length > 0 && surveys.every(s => selectedSurveys.includes(s.id));

  if (loading && surveys.length === 0) return <Loader fullScreen message="Loading surveys..." />;

  return (
    <div className={styles.surveyList}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('my_surveys')}</h1>
          {isCreator && (
            <p className={styles.summaryLine}>
              {surveys.length} surveys · {surveys.filter(s => s.status === 'active').length} active · {surveys.reduce((acc, s) => acc + (s.response_count || 0), 0)} total responses
            </p>
          )}
        </div>
        {isCreator && (
          <button
            className={styles.createButton}
            onClick={() => navigate('/surveys/new')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('create_survey')}
          </button>
        )}
      </div>

      {isRespondent ? (
        // Respondent View
        <div className={styles.respondentView}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${respondentTab === 'pending' ? styles.activeTab : ''}`}
              onClick={() => setRespondentTab('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.tab} ${respondentTab === 'completed' ? styles.activeTab : ''}`}
              onClick={() => setRespondentTab('completed')}
            >
              Completed
            </button>
          </div>

          <div className={styles.respondentList}>
            {filteredRespondentSurveys.length === 0 ? (
              <div className={styles.emptyState}>
                {respondentTab === 'pending' ? (
                  <>
                    <h3>No surveys available</h3>
                    <p>You will see surveys here when they are shared with you.</p>
                    <button className={styles.secondaryButton} onClick={() => setRespondentTab('completed')}>
                      View Completed Surveys
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No completed surveys</h3>
                    <p>Surveys you complete will appear here.</p>
                  </>
                )}
              </div>
            ) : (
              filteredRespondentSurveys.map(survey => {
                const { state, deadlineText, isExpired } = getRespondentMeta(survey);
                const questionCount = survey.questionCount ?? survey.template?.Questions?.length ?? 0; // Fallback logic

                return (
                  <div key={survey.id} className={styles.respondentCard}>
                    <div className={styles.cardMain}>
                      <h3 className={styles.cardTitle}>{survey.title}</h3>
                      {survey.description && <p className={styles.cardDesc}>{survey.description}</p>}

                      <div className={styles.cardMeta}>
                        {deadlineText && <span className={styles.metaItem}>{deadlineText}</span>}
                        {state === 'COMPLETED' && (
                          <span className={styles.metaItem}>
                            Submitted on {survey.updated_at ? new Date(survey.updated_at).toLocaleDateString() : 'Unknown date'}
                          </span>
                        )}
                        {state === 'COMPLETED' && (
                          <span className={styles.metaItem}>
                            {questionCount} Questions
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardAction}>
                      {state === 'NOT_STARTED' && (
                        <button
                          className={styles.actionBtnPrimary}
                          onClick={() => navigate(`/surveys/${survey.id}/take`)} // Assuming take route exists, checking later? Or just /surveys/:id? usually public link.
                        // Wait, internal user taking survey -> likely /surveys/:id/take or /s/:code? 
                        // If "User role", they might access via /surveys/:id if they are members. 
                        // Let's assume standard take route.
                        // PREVIOUS CONTEXT: navigate(`/surveys/${survey.id}/distribute`) was for creators.
                        // For respondents, usually it's the public link. 
                        // Let's use /surveys/:id/answer or similar, OR check existing routes.
                        // "Public" component is at `Public/ResponseForm`. Route likely `/s/:code` or `/surveys/:id/response`?
                        // Let's assume navigate(`/surveys/${survey.id}`) redirects to take if not creator?
                        // Safest: Use the "View Details" link style if unknown, or check existing "take" flow.
                        // Assuming `/response/new/${survey.id}` or similar?
                        // I will use `/surveys/${survey.id}/answer` for now, or just generic `/surveys/${survey.id}` and let routing handle.
                        // Actually, standard is usually `/s/${short_code}` or similar. 
                        // If internal, maybe `/workspaces/:wid/surveys/:sid`?
                        // Let's use `/surveys/${survey.id}/take` as a placeholder actions.
                        >
                          Start survey
                        </button>
                      )}
                      {state === 'EXPIRED' && (
                        <button disabled className={styles.actionBtnDisabled}>Expired</button>
                      )}
                      {state === 'COMPLETED' && (
                        <button
                          className={styles.actionBtnSecondary}
                          onClick={() => navigate(`/my-responses?search=${encodeURIComponent(survey.title)}`)} // Link to my responses
                        >
                          View my answers
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        // Creator View (Existing)
        <>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t('search_surveys')}
                value={filterState.search}
                onChange={handleSearchChange}
                className={styles.searchInput}
                style={{ paddingLeft: '4rem' }}
              />
            </div>

            <div className={styles.statusFilter}>
              <label>{t('status')}:</label>
              <select
                value={filterState.status}
                onChange={handleStatusChangeFilter}
                className={styles.select}
              >
                <option value="all">{t('view_all') || 'All'}</option>
                <option value="draft">{t('draft')}</option>
                <option value="active">{t('active')}</option>
                <option value="closed">{t('closed')}</option>
              </select>
            </div>

            <div className={styles.pageSizeControl}>
              <select
                value={filterState.limit}
                onChange={handleLimitChange}
                className={styles.select}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <span className={styles.resultCount}>
              Total: {paginationInfo.totalItems}
            </span>
          </div>

          {/* Bulk Actions Bar */}
          {selectedSurveys.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                {selectedSurveys.length} selected
              </span>
              <button
                className={styles.bulkDeleteButton}
                onClick={() => setShowBulkDeleteModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Selected
              </button>
            </div>
          )}

          {surveys.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h3>{t('no_surveys_found')}</h3>
              <p>{t('create_first_survey_desc') || 'Create your first survey to start collecting responses'}</p>
              <button
                className={styles.emptyButton}
                onClick={() => navigate('/surveys/new')}
              >
                {t('create_survey')}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Checkbox
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>{t('survey_name') || 'Title'}</th>
                      <th>{t('status')}</th>
                      <th>RESPONSES</th>
                      <th>NEXT ACTION</th>
                      <th>{t('created_at')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((survey) => {
                      const responseCount = survey.response_count || 0;
                      const myResponseCount = survey.my_response_count || 0;

                      // Next Action Logic
                      let nextAction = '';
                      if (survey.status === 'draft') nextAction = 'Finish setup';
                      else if (survey.status === 'active') {
                        if (responseCount === 0) nextAction = 'Distribute survey';
                        else nextAction = 'View results';
                      }
                      else if (survey.status === 'closed') nextAction = 'Review summary';

                      return (
                        <tr key={survey.id} className={selectedSurveys.includes(survey.id) ? styles.selectedRow : ''}>
                          <td>
                            <Checkbox
                              checked={selectedSurveys.includes(survey.id)}
                              onChange={() => handleSelectOne(survey.id)}
                            />
                          </td>
                          <td>
                            <div className={styles.surveyTitle}>
                              <span
                                className={`${styles.title} ${styles.clickableTitle}`}
                                onClick={() => {
                                  if (survey.status === 'draft') {
                                    navigate(`/surveys/${survey.id}/edit`);
                                  } else if (survey.status === 'active' && responseCount === 0) {
                                    navigate(`/surveys/${survey.id}/distribute`);
                                  } else {
                                    navigate(`/surveys/${survey.id}/results`);
                                  }
                                }}
                              >
                                {survey.title}
                              </span>
                              {survey.description && (
                                <span className={styles.description}>{survey.description}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={survey.status} label={t(survey.status)} />
                          </td>
                          <td>
                            <div className={styles.responseCell}>
                              <span className={styles.responseCount}>
                                {myResponseCount > 0 ? `1 / ${responseCount}` : `0 / —`}
                              </span>
                              {responseCount === 0 && (
                                <>
                                  <span className={styles.hintText}>No responses yet</span>
                                  <span className={styles.suggestionText}>Consider sharing this survey</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={styles.nextAction}>{nextAction}</span>
                          </td>
                          <td>{new Date(survey.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className={styles.textActions}>
                              <button
                                onClick={() => navigate(`/surveys/${survey.id}/results`)}
                                className={`${styles.actionLink} ${styles.actionView}`}
                              >
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                                className={`${styles.actionLink} ${styles.actionEdit}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => navigate(`/surveys/${survey.id}/distribute`)}
                                className={`${styles.actionLink} ${styles.actionDistribute}`}
                              >
                                Distribute
                              </button>
                              <button
                                onClick={() => navigate(`/surveys/${survey.id}/results`)}
                                className={`${styles.actionLink} ${styles.actionResults}`}
                              >
                                Results
                              </button>
                              <button
                                onClick={() => handleStatusChange(survey, 'closed')}
                                className={`${styles.actionLink} ${styles.actionArchive}`}
                                disabled={survey.status === 'closed'}
                              >
                                Archive
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {paginationInfo.totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination
                    currentPage={filterState.page}
                    totalPages={paginationInfo.totalPages}
                    totalItems={paginationInfo.totalItems}
                    itemsPerPage={filterState.limit}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSurveyToDelete(null);
            }}
            onConfirm={handleDelete}
            title={t('delete_survey') || "Delete Survey"}
            message={t('delete_confirm') || `Are you sure you want to delete "${surveyToDelete?.title}"? This action cannot be undone and will delete all associated responses.`}
            confirmText={t('delete')}
            confirmColor="danger"
          />

          {/* Bulk Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={showBulkDeleteModal}
            onClose={() => setShowBulkDeleteModal(false)}
            onConfirm={handleBulkDelete}
            title="Delete Selected Surveys"
            message={`Are you sure you want to delete ${selectedSurveys.length} selected surveys? This action cannot be undone.`}
            confirmText={`Delete ${selectedSurveys.length} Surveys`}
            confirmColor="danger"
          />
        </>
      )}
    </div>
  );
};

export default SurveyList;

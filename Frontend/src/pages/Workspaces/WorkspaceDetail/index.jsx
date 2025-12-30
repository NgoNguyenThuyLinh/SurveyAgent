import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkspaceService from '../../../api/services/workspace.service';
import CollectorService from '../../../api/services/collector.service';
import { useToast } from '../../../contexts/ToastContext';
import Loader from '../../../components/common/Loader/Loader';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmModal from '../../../components/UI/ConfirmModal';
import styles from './WorkspaceDetail.module.scss';
import {
  LuLayoutDashboard,
  LuUsers,
  LuFileText,
  LuActivity,
  LuSettings,
  LuTrash2,
  LuLogOut,
  LuUserPlus,
  LuClipboardList,
  LuGlobe,
  LuLock
} from 'react-icons/lu';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member'
  });
  const [inviting, setInviting] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    visibility: 'workspace_members'
  });
  const [updating, setUpdating] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Remove member confirmation
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Leave workspace confirmation
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);


  const loadWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      // Load workspace details
      const workspaceResult = await WorkspaceService.getWorkspaceById(id);
      console.log('[WorkspaceDetail] Workspace API result:', workspaceResult);
      if (workspaceResult.ok) {
        console.log('[WorkspaceDetail] Workspace data:', workspaceResult.data);
        setWorkspace(workspaceResult.data);
        // Set surveys from workspace data
        setSurveys(workspaceResult.data.surveys || []);
        // Initialize edit form with current workspace data
        setEditForm({
          name: workspaceResult.data.name || '',
          description: workspaceResult.data.data || '',
          visibility: workspaceResult.data.visibility || 'private'
        });
      } else {
        showToast(workspaceResult.error || 'Failed to load workspace', 'error');
        return;
      }

      // Load activities
      const activitiesResult = await WorkspaceService.getWorkspaceActivities(id);
      if (activitiesResult.ok) {
        setActivities(activitiesResult.activities || []);
      }
    } catch (error) {
      showToast('Error loading workspace data', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteForm.email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

    setInviting(true);
    try {
      const result = await WorkspaceService.inviteToWorkspace(
        id,
        inviteForm.email.trim(),
        inviteForm.role
      );

      if (result.ok) {
        showToast('Invitation sent successfully', 'success');
        setShowInviteModal(false);
        setInviteForm({ email: '', role: 'member' });
        // Refresh activities to show invitation activity
        loadWorkspaceData();
      } else {
        showToast(result.error || 'Failed to send invitation', 'error');
      }
    } catch (error) {
      showToast('Error sending invitation', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = (userId, username) => {
    setMemberToRemove({ userId, username });
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      const result = await WorkspaceService.removeMember(id, memberToRemove.userId);
      if (result.ok) {
        showToast('Member removed successfully', 'success');
        loadWorkspaceData(); // Refresh data
      } else {
        showToast(result.error || 'Failed to remove member', 'error');
      }
    } catch (error) {
      showToast('Error removing member', 'error');
    } finally {
      setShowRemoveModal(false);
      setMemberToRemove(null);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      showToast('Workspace name is required', 'error');
      return;
    }

    setUpdating(true);
    try {
      const result = await WorkspaceService.updateWorkspace(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        visibility: editForm.visibility
      });

      if (result.ok) {
        showToast('Workspace updated successfully', 'success');
        setShowEditModal(false);
        loadWorkspaceData(); // Refresh data
      } else {
        showToast(result.error || 'Failed to update workspace', 'error');
      }
    } catch (error) {
      showToast('Error updating workspace', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    setDeleting(true);
    try {
      const result = await WorkspaceService.deleteWorkspace(id);

      if (result.ok) {
        showToast('Workspace deleted successfully', 'success');
        // Navigate back to workspaces list
        navigate('/workspaces');
      } else {
        showToast(result.error || 'Failed to delete workspace', 'error');
      }
    } catch (error) {
      showToast('Error deleting workspace', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    setLeaving(true);
    try {
      const result = await WorkspaceService.leaveWorkspace(id);

      if (result.ok) {
        showToast('Successfully left workspace', 'success');
        // Navigate back to workspaces list
        navigate('/workspaces');
      } else {
        showToast(result.error || 'Failed to leave workspace', 'error');
      }
    } catch (error) {
      showToast('Error leaving workspace', 'error');
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };


  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'owner': return styles.roleOwner;
      case 'collaborator': return styles.roleCollaborator;
      case 'member': return styles.roleMember;
      case 'viewer': return styles.roleViewer;
      default: return styles.roleMember;
    }
  };

  const formatActivityAction = (action) => {
    const actionMap = {
      'created': 'created the workspace',
      'joined': 'joined the workspace',
      'left': 'left the workspace',
      'survey_created': 'created a survey',
      'survey_updated': 'updated a survey',
      'survey_deleted': 'deleted a survey',
      'member_invited': 'invited a member',
      'member_removed': 'removed a member'
    };
    return actionMap[action] || action;
  };

  const getNextAction = () => {
    // No surveys → suggest creating first survey
    if (!surveys || surveys.length === 0) {
      return {
        message: 'Create your first survey',
        action: () => navigate('/templates'),
        buttonText: 'Create Survey'
      };
    }

    // Has surveys but none distributed → suggest distributing
    // Check if any survey has status 'active' or 'published'
    const hasActiveSurveys = surveys.some(s => s.status === 'active' || s.status === 'published');
    if (!hasActiveSurveys) {
      return {
        message: 'Distribute a survey',
        action: () => navigate(`/surveys/${surveys[0].id}/distribute`),
        buttonText: 'Distribute Survey'
      };
    }

    // Has active surveys → suggest viewing analytics
    return {
      message: 'View analytics',
      action: () => navigate('/analytics'),
      buttonText: 'View Analytics'
    };
  };

  const handleTakeSurvey = async (survey) => {

    try {
      // Create a workspace collector for this survey
      const result = await CollectorService.createWorkspaceCollector(survey.id, {
        name: `Workspace Response - ${survey.title}`,
        type: 'workspace',
        workspaceId: parseInt(id)  // Pass workspace ID from URL params
      });

      if (result.ok && result.data?.token) {
        // Open the response form in new tab with collector token
        window.open(`/public/${result.data.token}`, '_blank');
      } else {
        showToast('Failed to generate survey link', 'error');
      }
    } catch (error) {
      console.error('Error taking survey:', error);
      showToast('Error opening survey form', 'error');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!workspace) {
    return (
      <div className={styles.error}>
        <h2>Workspace not found</h2>
        <p>The workspace you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const canInvite = workspace.role === 'owner' || workspace.role === 'collaborator';
  const canRemoveMembers = workspace.role === 'owner';
  const canEditWorkspace = workspace.role === 'owner';
  const canDeleteWorkspace = workspace.role === 'owner';




  return (
    <div className={styles.workspaceDetail}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h1>{workspace.name}</h1>
            <span className={`${styles.roleBadge} ${getRoleBadgeClass(workspace.role)}`}>
              {workspace.role.charAt(0).toUpperCase() + workspace.role.slice(1)}
            </span>
          </div>
          {workspace.description && (
            <p className={styles.description}>{workspace.description}</p>
          )}

          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <LuUsers size={16} />
              <span>{(workspace?.members || []).length} members</span>
            </div>
            <div className={styles.divider}>•</div>
            <div className={styles.metaItem}>
              <LuFileText size={16} />
              <span>{(surveys || []).length} surveys</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          {canInvite && (
            <button
              className={styles.inviteButton}
              onClick={() => setShowInviteModal(true)}
            >
              <LuUserPlus size={16} /> Invite
            </button>
          )}
          {canInvite && (
            <button
              className={styles.manageInvitationsButton}
              onClick={() => navigate(`/workspaces/${id}/invitations`)}
              title="Manage Invitations"
            >
              <LuClipboardList size={16} />
            </button>
          )}
          {canEditWorkspace && (
            <button
              className={styles.editButton}
              onClick={() => setShowEditModal(true)}
              title="Settings"
            >
              <LuSettings size={16} />
            </button>
          )}
          {canDeleteWorkspace && (
            <button
              className={styles.deleteButton}
              onClick={() => setShowDeleteModal(true)}
              title="Delete Workspace"
            >
              <LuTrash2 size={16} />
            </button>
          )}
          {workspace.role !== 'owner' && (
            <button
              className={styles.leaveButton}
              onClick={() => setShowLeaveModal(true)}
            >
              <LuLogOut size={16} /> Leave
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LuLayoutDashboard size={18} /> Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'members' ? styles.active : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <LuUsers size={18} /> Members ({(workspace?.members || []).length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'surveys' ? styles.active : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          <LuFileText size={18} /> Surveys ({(surveys || []).length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'activities' ? styles.active : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <LuActivity size={18} /> Activities
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statsCards}>
              <div className={styles.statCard}>
                <h3>Members</h3>
                <div className={styles.statValue}>{(workspace?.members || []).length}</div>
                <p className={styles.statLabel}>
                  {(workspace?.members || []).length === 0
                    ? 'Invite team members to collaborate'
                    : (workspace?.members || []).length === 1
                      ? 'Add more collaborators'
                      : 'Collaborating on surveys'}
                </p>
              </div>
              <div className={styles.statCard}>
                <h3>Surveys</h3>
                <div className={styles.statValue}>{(surveys || []).length}</div>
                <p className={styles.statLabel}>
                  {(surveys || []).length === 0
                    ? 'Create your first survey'
                    : `${surveys.filter(s => s.status === 'active').length} active, ${surveys.filter(s => s.status === 'draft').length} draft`}
                </p>
              </div>
              <div className={styles.statCard}>
                <h3>Recent Activity</h3>
                <div className={styles.statValue}>{(activities || []).length}</div>
                <p className={styles.statLabel}>
                  {(activities || []).length === 0
                    ? 'No activity yet'
                    : (activities || []).length === 1
                      ? 'Latest workspace action'
                      : 'Workspace actions logged'}
                </p>
              </div>
            </div>

            {/* Next Action Section */}
            <div className={styles.nextAction}>
              <h3>Next Action</h3>
              <div className={styles.nextActionContent}>
                <p className={styles.nextActionMessage}>{getNextAction().message}</p>
                <button
                  className={styles.nextActionButton}
                  onClick={getNextAction().action}
                >
                  {getNextAction().buttonText}
                </button>
              </div>
            </div>

            <div className={styles.recentActivities}>
              <h3>Recent Activities</h3>
              {(activities || []).slice(0, 5).map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityUser}>
                    {activity.user?.full_name || activity.user?.username}
                  </div>
                  <div className={styles.activityAction}>
                    {formatActivityAction(activity.action)}
                  </div>
                  <div className={styles.activityTime}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {(activities || []).length === 0 && (
                <p className={styles.noData}>No recent activities</p>
              )}
              {(activities || []).length > 5 && (
                <div className={styles.viewAllLink}>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={styles.viewAllButton}
                  >
                    View all activity ({(activities || []).length} total)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className={styles.members}>
            <div className={styles.sectionHeader}>
              <h3>Workspace Members</h3>
              {canInvite && (
                <button
                  className={styles.inviteButton}
                  onClick={() => setShowInviteModal(true)}
                >
                  + Invite Member
                </button>
              )}
            </div>
            <div className={styles.membersList}>
              {(workspace?.members || []).map((member) => (
                <div key={member.id || member.user_id} className={styles.memberCard}>
                  <div className={styles.memberAvatar}>
                    <div className={styles.avatarCircle}>
                      {(member.full_name || member.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      {member.full_name || member.username || 'Unknown User'}
                    </div>
                    <div className={styles.memberEmail}>
                      {member.email}
                    </div>
                    <div className={styles.memberMeta}>
                      Joined workspace • Active member
                    </div>
                  </div>
                  <div className={styles.memberRole}>
                    <span className={`${styles.roleBadge} ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <div className={styles.memberActions}>
                    {canRemoveMembers && member.role !== 'owner' && (
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveMember(member.user_id, member.username)}
                        title="Remove member"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(workspace?.members || []).length === 0 && (
                <div className={styles.emptyState}>
                  <p>No members yet</p>
                  <p className={styles.emptyStateSubtext}>Invite team members to collaborate on surveys</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className={styles.surveys}>
            <div className={styles.sectionHeader}>
              <h3>Workspace Surveys</h3>
            </div>
            <div className={styles.surveysList}>
              {(surveys || []).map((survey) => (
                <div key={survey.id} className={styles.surveyCard}>
                  <div className={styles.surveyHeader}>
                    <h4 className={styles.surveyTitle}>{survey.title}</h4>
                    <span className={`${styles.statusBadge} ${styles[`status${survey.status}`]}`}>
                      {survey.status}
                    </span>
                  </div>
                  <div className={styles.surveyMeta}>
                    <span className={styles.surveyVisibility}>
                      {survey.visibility === 'public' ? (
                        <><LuGlobe size={14} /> Public</>
                      ) : (
                        <><LuLock size={14} /> Workspace Only</>
                      )}
                    </span>
                    <span className={styles.surveyCreated}>
                      Created by {survey.created_by === workspace?.owner_id ? 'Owner' : 'Collaborator'}
                    </span>
                  </div>
                  <div className={styles.surveyActions}>
                    <button
                      className={styles.viewSurveyButton}
                      onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                    >
                      View Survey
                    </button>
                    <button
                      className={styles.takeSurveyButton}
                      onClick={() => handleTakeSurvey(survey)}
                      title="Take this survey as a respondent"

                    >
                      Take Survey
                    </button>
                  </div>
                </div>
              ))}
              {(surveys || []).length === 0 && (
                <div className={styles.emptyState}>
                  <p>No surveys yet</p>
                  <p className={styles.emptyStateSubtext}>Create your first survey to get started</p>
                  <button
                    className={styles.createSurveyButton}
                    onClick={() => navigate('/surveys/new')}
                  >
                    + Create Survey
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className={styles.activities}>
            <div className={styles.sectionHeader}>
              <h3>Workspace Activities</h3>
            </div>
            <div className={styles.activitiesList}>
              {(activities || []).map((activity, index) => (
                <div key={index} className={styles.activityCard}>
                  <div className={styles.activityAvatar}>
                    <div className={styles.avatarCircle}>
                      {(activity.user?.full_name || activity.user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityHeader}>
                      <span className={styles.activityUser}>
                        {activity.user?.full_name || activity.user?.username || 'Unknown User'}
                      </span>
                      <span className={styles.activityAction}>
                        {formatActivityAction(activity.action)}
                      </span>
                      <span className={styles.activityTime}>
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    {activity.metadata && activity.action === 'workspace_updated' && (
                      <div className={styles.activityDetails}>
                        <div className={styles.changesSummary}>
                          {activity.metadata.updated && (
                            <div className={styles.changesItem}>
                              <span className={styles.changesLabel}>Changes made:</span>
                              <div className={styles.changesList}>
                                {activity.metadata.previous?.name !== activity.metadata.updated?.name && (
                                  <div className={styles.changeItem}>
                                    <strong>Name:</strong> "{activity.metadata.previous?.name || 'None'}" → "{activity.metadata.updated?.name || 'None'}"
                                  </div>
                                )}
                                {activity.metadata.previous?.description !== activity.metadata.updated?.description && (
                                  <div className={styles.changeItem}>
                                    <strong>Description:</strong> "{activity.metadata.previous?.description || 'None'}" → "{activity.metadata.updated?.description || 'None'}"
                                  </div>
                                )}
                                {activity.metadata.previous?.visibility !== activity.metadata.updated?.visibility && (
                                  <div className={styles.changeItem}>
                                    <strong>Visibility:</strong> {activity.metadata.previous?.visibility || 'private'} → {activity.metadata.updated?.visibility || 'private'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activity.metadata && activity.action !== 'workspace_updated' && (
                      <div className={styles.activityMeta}>
                        <span className={styles.activityType}>Additional details available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(activities || []).length === 0 && (
                <div className={styles.emptyState}>
                  <p>No activities yet</p>
                  <p className={styles.emptyStateSubtext}>Workspace activities will appear here as members interact</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
      >
        <form onSubmit={handleInvite} className={styles.inviteForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={inviteForm.role}
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="member">Member - Can answer surveys</option>
              <option value="collaborator">Collaborator - Can create and edit surveys</option>
              <option value="viewer">Viewer - Can only view results</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className={styles.inviteSubmitButton}
            >
              {inviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Workspace Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Workspace"
      >
        <form onSubmit={handleUpdateWorkspace} className={styles.editForm}>
          <div className={styles.formGroup}>
            <label htmlFor="editName">Workspace Name</label>
            <input
              id="editName"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter workspace name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editDescription">Description (Optional)</label>
            <textarea
              id="editDescription"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter workspace description"
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editVisibility">Visibility</label>
            <select
              id="editVisibility"
              value={editForm.visibility}
              onChange={(e) => setEditForm(prev => ({ ...prev, visibility: e.target.value }))}
            >
              <option value="private">Private - Only invited members can see</option>
              <option value="public">Public - Anyone can request to join</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className={styles.updateButton}
            >
              {updating ? 'Updating...' : 'Update Workspace'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workspace"
      >
        <div className={styles.deleteConfirmation}>
          <p>Are you sure you want to delete <strong>{workspace.name}</strong>?</p>
          <p className={styles.deleteWarning}>
            This action cannot be undone. All surveys, responses, and data associated with this workspace will be permanently deleted.
          </p>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteWorkspace}
              disabled={deleting}
              className={styles.deleteConfirmButton}
            >
              {deleting ? 'Deleting...' : 'Delete Workspace'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showRemoveModal}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.username} from this workspace?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
      />

      <ConfirmModal
        isOpen={showLeaveModal}
        title="Leave Workspace"
        message={`Are you sure you want to leave "${workspace.name}"? You will need to be re-invited to access this workspace again.`}
        confirmText={leaving ? 'Leaving...' : 'Leave Workspace'}
        cancelText="Cancel"
        isDangerous
        onConfirm={handleLeaveWorkspace}
        onCancel={() => setShowLeaveModal(false)}
      />
    </div >
  );
};

export default WorkspaceDetail;

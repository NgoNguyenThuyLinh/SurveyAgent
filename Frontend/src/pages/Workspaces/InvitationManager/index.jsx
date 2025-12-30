// src/pages/Workspaces/InvitationManager/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import WorkspaceService from '../../../api/services/workspace.service';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmModal from '../../../components/UI/ConfirmModal';
import styles from './InvitationManager.module.scss';

export default function InvitationManager() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which invitation is being actioned
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState(null);
  
  // Cancel invitation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState(null);

  useEffect(() => {
    loadInvitations();
  }, [workspaceId]);

  const loadInvitations = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await WorkspaceService.getPendingInvitations(workspaceId);
      
      if (result.ok) {
        setInvitations(result.invitations || []);
      } else {
        setError(result.error || 'Failed to load invitations');
        showToast(result.error || 'Failed to load invitations', 'error');
      }
    } catch (err) {
      setError(err.message);
      showToast('Error loading invitations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = (invitationId, inviteeEmail) => {
    setInvitationToCancel({ id: invitationId, email: inviteeEmail });
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!invitationToCancel) return;

    setActionLoading(invitationToCancel.id);

    try {
      const result = await WorkspaceService.cancelInvitation(invitationToCancel.id);
      
      if (result.ok) {
        showToast('Invitation cancelled successfully', 'success');
        // Remove from list
        setInvitations(invitations.filter(inv => inv.id !== invitationToCancel.id));
      } else {
        showToast(result.error || 'Failed to cancel invitation', 'error');
      }
    } catch (err) {
      showToast('Error cancelling invitation', 'error');
    } finally {
      setActionLoading(null);
      setShowCancelModal(false);
      setInvitationToCancel(null);
    }
  };

  const handleResendInvitation = async (invitationId, inviteeEmail) => {
    setActionLoading(invitationId);

    try {
      const result = await WorkspaceService.resendInvitation(invitationId);
      
      if (result.ok) {
        showToast(`Invitation resent to ${inviteeEmail}`, 'success');
        // Reload invitations to update the UI
        await loadInvitations();
      } else {
        showToast(result.error || 'Failed to resend invitation', 'error');
      }
    } catch (err) {
      showToast('Error resending invitation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': { className: styles.statusPending, label: 'Pending' },
      'accepted': { className: styles.statusAccepted, label: 'Accepted' },
      'rejected': { className: styles.statusRejected, label: 'Rejected' },
      'cancelled': { className: styles.statusCancelled, label: 'Cancelled' },
      'expired': { className: styles.statusExpired, label: 'Expired' }
    };

    const statusStyle = statusStyles[status] || statusStyles['pending'];
    return <span className={statusStyle.className}>{statusStyle.label}</span>;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={`/workspace/${workspaceId}`} className={styles.backLink}>
          ← Back to Workspace
        </Link>
        <h2>Manage Invitations</h2>
        <p className={styles.subtitle}>View and manage invitations you've sent to join this workspace</p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button onClick={loadInvitations} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.invitationsList}>
        {invitations.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No pending invitations</p>
            <p className={styles.emptySubtext}>
              When you invite people to this workspace, they'll appear here
            </p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.colEmail}>Email</div>
              <div className={styles.colRole}>Role</div>
              <div className={styles.colStatus}>Status</div>
              <div className={styles.colSentAt}>Sent At</div>
              <div className={styles.colExpires}>Expires</div>
              <div className={styles.colActions}>Actions</div>
            </div>

            {invitations.map((invitation) => (
              <div key={invitation.id} className={styles.tableRow}>
                <div className={styles.colEmail}>
                  <span className={styles.email}>{invitation.inviteeEmail}</span>
                </div>
                <div className={styles.colRole}>
                  <span className={styles.role}>{invitation.role || 'member'}</span>
                </div>
                <div className={styles.colStatus}>
                  {getStatusBadge(invitation.status)}
                </div>
                <div className={styles.colSentAt}>
                  <span className={styles.date}>{formatDate(invitation.sentAt)}</span>
                </div>
                <div className={styles.colExpires}>
                  <span className={`${styles.date} ${isExpired(invitation.expiresAt) ? styles.expired : ''}`}>
                    {formatDate(invitation.expiresAt)}
                  </span>
                </div>
                <div className={styles.colActions}>
                  <div className={styles.actionButtons}>
                    {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.resendBtn}`}
                          onClick={() => handleResendInvitation(invitation.id, invitation.inviteeEmail)}
                          disabled={actionLoading === invitation.id}
                          title="Resend invitation"
                        >
                          {actionLoading === invitation.id ? 'Resending...' : 'Resend'}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => handleCancelInvitation(invitation.id, invitation.inviteeEmail)}
                          disabled={actionLoading === invitation.id}
                          title="Cancel invitation"
                        >
                          {actionLoading === invitation.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {invitation.status === 'pending' && isExpired(invitation.expiresAt) && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.resendBtn}`}
                          onClick={() => handleResendInvitation(invitation.id, invitation.inviteeEmail)}
                          disabled={actionLoading === invitation.id}
                          title="Resend invitation (expired)"
                        >
                          {actionLoading === invitation.id ? 'Resending...' : 'Resend'}
                        </button>
                      </>
                    )}
                    {(invitation.status !== 'pending' || isExpired(invitation.expiresAt)) && (
                      <button
                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                        onClick={() => handleCancelInvitation(invitation.id, invitation.inviteeEmail)}
                        disabled={actionLoading === invitation.id}
                        title="Remove from list"
                      >
                        {actionLoading === invitation.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <ConfirmModal
          isOpen={showCancelModal}
          title="Cancel Invitation"
          message={`Are you sure you want to cancel the invitation to ${invitationToCancel?.email}?`}
          confirmText="Cancel Invitation"
          cancelText="Keep Invitation"
          isDangerous
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setShowCancelModal(false);
            setInvitationToCancel(null);
          }}
        />
      </div>
    </div>
  );
}

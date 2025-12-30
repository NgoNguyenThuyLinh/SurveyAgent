import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ManageInvitations.module.scss';
import WorkspaceService from '../../../api/services/workspace.service';

const ManageInvitations = () => {
  const { id: workspaceId } = useParams();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspace, setWorkspace] = useState(null);

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get workspace info
      const workspaceResult = await WorkspaceService.getWorkspace(workspaceId);
      if (!workspaceResult.ok) {
        setError('Failed to load workspace');
        return;
      }
      setWorkspace(workspaceResult.data);

      // Get pending invitations
      const invitationsResult = await WorkspaceService.getPendingInvitations(workspaceId);
      if (invitationsResult.ok) {
        setInvitations(invitationsResult.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelInvitation = async (invitationId) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Cancel Invitation',
      message: 'Are you sure you want to cancel this invitation?',
      confirmText: 'Cancel Invitation',
      cancelText: 'Keep It',
      onConfirm: async () => {
        try {
          const result = await WorkspaceService.cancelInvitation(invitationId);
          if (result.ok) {
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Success',
              message: 'Invitation cancelled successfully',
              confirmText: 'OK',
              onConfirm: () => setModal({ ...modal, isOpen: false })
            });
          } else {
            setModal({
              isOpen: true,
              type: 'error',
              title: 'Error',
              message: 'Failed to cancel invitation: ' + (result.message || 'Unknown error'),
              confirmText: 'OK',
              onConfirm: () => setModal({ ...modal, isOpen: false })
            });
          }
        } catch (err) {
          console.error('Error canceling invitation:', err);
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to cancel invitation',
            confirmText: 'OK',
            onConfirm: () => setModal({ ...modal, isOpen: false })
          });
        }
      },
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const result = await WorkspaceService.resendInvitation(invitationId);
      if (result.ok) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Invitation resent successfully!',
          confirmText: 'OK',
          onConfirm: () => setModal({ ...modal, isOpen: false })
        });
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to resend invitation: ' + (result.message || 'Unknown error'),
          confirmText: 'OK',
          onConfirm: () => setModal({ ...modal, isOpen: false })
        });
      }
    } catch (err) {
      console.error('Error resending invitation:', err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to resend invitation',
        confirmText: 'OK',
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className={styles.backButton}>
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className={styles.backButton}>
          ← Back
        </button>
        <h1>Manage Invitations</h1>
        <p className={styles.workspaceName}>{workspace?.name}</p>
      </div>

      {invitations.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No pending invitations</p>
        </div>
      ) : (
        <div className={styles.invitationsList}>
          {invitations.map(invitation => (
            <div key={invitation.id} className={styles.invitationCard}>
              <div className={styles.invitationInfo}>
                <div className={styles.email}>{invitation.invitee_email}</div>
                <div className={styles.role}>Role: <strong>{invitation.role}</strong></div>
                <div className={styles.status}>
                  Status: <span className={`${styles.statusBadge} ${styles[invitation.status]}`}>
                    {invitation.status}
                  </span>
                </div>
                <div className={styles.dates}>
                  <span className={styles.sentDate}>
                    Sent: {new Date(invitation.created_at).toLocaleDateString()}
                  </span>
                  {invitation.expires_at && (
                    <span className={styles.expiresDate}>
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {invitation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleResendInvitation(invitation.id)}
                      className={styles.resendButton}
                      title="Resend invitation email"
                    >
                      🔄 Resend
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className={styles.cancelButton}
                      title="Cancel this invitation"
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modal.isOpen && (
        <div className={`${styles.modalOverlay} ${styles[modal.type]}`}>
          <div className={`${styles.modal} ${styles[modal.type]}`}>
            <div className={styles.modalHeader}>
              <h2>{modal.title}</h2>
              <button
                className={styles.closeButton}
                onClick={() => modal.onCancel ? modal.onCancel() : setModal({ ...modal, isOpen: false })}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>{modal.message}</p>
            </div>
            <div className={styles.modalFooter}>
              {modal.type === 'warning' && (
                <>
                  <button
                    className={`${styles.modalButton} ${styles.secondary}`}
                    onClick={() => modal.onCancel ? modal.onCancel() : setModal({ ...modal, isOpen: false })}
                  >
                    {modal.cancelText || 'Cancel'}
                  </button>
                  <button
                    className={`${styles.modalButton} ${styles.danger}`}
                    onClick={() => {
                      if (modal.onConfirm) modal.onConfirm();
                    }}
                  >
                    {modal.confirmText || 'Confirm'}
                  </button>
                </>
              )}
              {modal.type !== 'warning' && (
                <button
                  className={`${styles.modalButton} ${styles[modal.type] || 'primary'}`}
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                  }}
                >
                  {modal.confirmText || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInvitations;

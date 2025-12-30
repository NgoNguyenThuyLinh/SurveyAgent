import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InviteService from '../../../api/services/invite.service';
import Loader from '../../../components/common/Loader/Loader';
import { useToast } from '../../../contexts/ToastContext';
import styles from './InvitationAccept.module.scss'; // We'll create this SCSS next

const InvitationAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await InviteService.validateToken(token);
        if (data.valid) {
          setInviteData(data);
        } else {
          setError('Invalid invitation token');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    if (token) validateToken();
  }, [token]);

  const handleAccept = async () => {
    try {
      setAccepting(true);
      const result = await InviteService.acceptInvite(token);

      showToast('Invitation accepted! Redirecting...', 'success');

      if (result.redirect_url) {
        // Determine if it's internal route or external
        if (result.redirect_url.startsWith('http')) {
          window.location.href = result.redirect_url;
        } else {
          navigate(result.redirect_url);
        }
      } else {
        showToast('No redirect URL found', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept invitation', 'error');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <div className={styles.container}><Loader /></div>;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Invitation Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className={styles.secondaryBtn}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>You're Invited!</h1>
          <p>You have been invited to participate in a survey.</p>
        </div>

        {inviteData && inviteData.survey && (
          <div className={styles.surveyInfo}>
            <h3>{inviteData.survey.title}</h3>
            {inviteData.survey.description && (
              <p className={styles.description}>{inviteData.survey.description}</p>
            )}
            <div className={styles.meta}>
              <span>Invited Email: <strong>{inviteData.email}</strong></span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.acceptBtn}
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? 'Starting Survey...' : 'Accept & Start Survey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationAccept;

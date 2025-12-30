import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import UserService from '../../../api/services/user.service';
import AuthService from '../../../api/services/auth.service';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import Loader from '../../../components/common/Loader/Loader';
import styles from './Profile.module.scss';

const Profile = () => {
    const { state, dispatch } = useAuth();
    const { showSuccess, showError } = useToast();

    // Form States
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        email: '',
        username: '', // Read-only
        role: ''      // Read-only
    });

    // To track changes (dirty state)
    const [initialProfileForm, setInitialProfileForm] = useState(null);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Loading States
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Validation State
    const [profileTouched, setProfileTouched] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (state.user) {
            const initialData = {
                full_name: state.user.full_name || '',
                email: state.user.email || '',
                username: state.user.username || '',
                role: state.user.role || 'user'
            };
            setProfileForm(initialData);
            setInitialProfileForm(initialData);
        }
    }, [state.user]);

    // --- Helpers ---

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isProfileDirty = () => {
        if (!initialProfileForm) return false;
        return (
            profileForm.full_name !== initialProfileForm.full_name ||
            profileForm.email !== initialProfileForm.email
        );
    };

    const isProfileValid = () => {
        return (
            profileForm.full_name.trim().length > 0 &&
            profileForm.email.trim().length > 0 &&
            isValidEmail(profileForm.email)
        );
    };

    // --- Handlers ---

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileTouched(true);

        if (!isProfileDirty() || !isProfileValid()) return;

        setSavingProfile(true);
        try {
            const response = await UserService.updateUser(state.user.id, {
                full_name: profileForm.full_name,
                email: profileForm.email
            });

            const updatedUser = response.data?.user || response.data;

            // Update Context
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });

            // Sync local state
            const newData = {
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role
            };
            setProfileForm(newData);
            setInitialProfileForm(newData);

            showSuccess('Profile information updated successfully.');
        } catch (error) {
            console.error('Update profile error:', error);
            showError(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!passwordForm.currentPassword) {
            showError('Please enter your current password.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showError('New password must be at least 6 characters.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError('New passwords do not match.');
            return;
        }

        setSavingPassword(true);
        try {
            await AuthService.changePassword({
                oldPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            showSuccess('Password updated successfully.');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Change password error:', error);
            showError(error.response?.data?.message || 'Failed to update password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return styles.roleAdmin;
            case 'creator': return styles.roleCreator;
            default: return styles.roleUser;
        }
    };

    if (!state.user) return <Loader />;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1>Profile Settings</h1>
                <p>Manage your account settings and security.</p>
            </div>

            <div className={styles.content}>
                {/* Left Column: User Summary */}
                <div className={styles.leftColumn}>
                    <Card className={styles.userCard}>
                        <div className={styles.avatar}>
                            {state.user.full_name ? state.user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2>{state.user.full_name || state.user.username}</h2>
                        <span className={`${styles.roleBadge} ${getRoleBadgeClass(state.user.role)}`}>
                            {state.user.role}
                        </span>
                        <p className={styles.email}>{state.user.email}</p>
                    </Card>
                </div>

                {/* Right Column: Forms */}
                <div className={styles.rightColumn}>

                    {/* A) Profile Information */}
                    <Card title="Profile Information" className={styles.sectionCard}>
                        <form onSubmit={handleProfileSubmit}>
                            <div className={styles.formGrid}>
                                {/* Read-Only Fields */}
                                <Input
                                    label="Username"
                                    value={profileForm.username}
                                    disabled={true}
                                    className={styles.readOnlyInput}
                                />
                                <Input
                                    label="Role"
                                    value={profileForm.role?.toUpperCase()}
                                    disabled={true}
                                    className={styles.readOnlyInput}
                                />

                                {/* Editable Fields */}
                                <Input
                                    label="Full Name"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    required
                                    placeholder="Enter your full name"
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    placeholder="name@example.com"
                                    error={profileTouched && !isValidEmail(profileForm.email) ? "Invalid email format" : null}
                                />
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    type="submit"
                                    disabled={!isProfileDirty() || !isProfileValid() || savingProfile}
                                    className={styles.primaryButton}
                                >
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* B) Security (Password) */}
                    <Card title="Security" className={styles.sectionCard}>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className={styles.passwordGrid}>
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    required
                                    placeholder="••••••••"
                                />
                                <div className={styles.newPasswordRow}>
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                        placeholder="Min 6 characters"
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={
                                        !passwordForm.currentPassword ||
                                        !passwordForm.newPassword ||
                                        !passwordForm.confirmPassword ||
                                        savingPassword
                                    }
                                >
                                    {savingPassword ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Profile;

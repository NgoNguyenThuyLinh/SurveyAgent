import React, { useState } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import AuthService from '../../../api/services/auth.service';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
// import LanguageSwitcher from '../../../components/UI/LanguageSwitcher'; // Commented out - not used
import styles from './Settings.module.scss';

const Settings = () => {
    const { showToast } = useToast();
    const { t } = useLanguage();
    const [saving, setSaving] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setPasswordForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast(t('passwords_do_not_match'), 'error');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showToast(t('password_too_short'), 'error');
            return;
        }

        try {
            setSaving(true);
            await AuthService.changePassword({
                oldPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            showToast(t('password_changed'), 'success');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Change password error:', error);
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.header}>
                <h1>{t('settings_page')}</h1>
                <p>{t('manage_account_settings')}</p>
            </div>

            <div className={styles.content}>
                {/* TEMPORARILY DISABLED - Language Switcher
                <Card title={t('language')}>
                    <LanguageSwitcher />
                </Card>
                */}


                <Card title={t('security')}>
                    <div className={styles.sectionHeader}>
                        <h3>{t('change_password')}</h3>
                        <p>{t('change_password_desc')}</p>
                    </div>

                    <form onSubmit={handlePasswordChange}>
                        <div className={styles.formStack}>
                            <Input
                                type="password"
                                label={t('current_password')}
                                value={passwordForm.currentPassword}
                                onChange={(e) => handleChange('currentPassword', e.target.value)}
                                placeholder={t('current_password')}
                                required
                            />
                            <Input
                                type="password"
                                label={t('new_password')}
                                value={passwordForm.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                placeholder={t('new_password')}
                                required
                            />
                            <Input
                                type="password"
                                label={t('confirm_new_password')}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                placeholder={t('confirm_new_password')}
                                required
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button type="submit" disabled={saving}>
                                {saving ? t('updating') : t('update_password')}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Settings;

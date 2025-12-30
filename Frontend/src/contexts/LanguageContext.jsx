import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
    // Force English language - always use 'en'
    const [language, setLanguage] = useState(() => {
        // Clear any saved language preference
        localStorage.removeItem('language');
        return 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        // Simple interpolation: replace {{key}} with params[key]
        if (typeof value === 'string' && params) {
            Object.keys(params).forEach(paramKey => {
                value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
            });
        }

        return value;
    };

    /**
     * Safe translation helper: returns fallback if translation missing or equals key
     */
    const tSafe = (key, fallback = '') => {
        const val = t(key);
        // If translation missing (val equals key or empty), return fallback
        if (val === key || !val) return fallback;
        return val;
    };

    const value = {
        language,
        setLanguage,
        t,
        tSafe
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

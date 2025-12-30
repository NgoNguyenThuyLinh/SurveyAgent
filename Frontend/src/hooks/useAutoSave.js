
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for auto-saving form data to localStorage
 * @param {string} key - Unique key for storage (e.g., 'survey_draft_new')
 * @param {Object} data - Data to save
 * @param {number} delay - Debounce delay in ms (default 1000)
 */
const useAutoSave = (key, data, delay = 1000) => {
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const timeoutRef = useRef(null);
    const initialLoadRef = useRef(false);

    // Load initial data
    const loadSavedData = useCallback(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error loading auto-save data:', e);
            return null;
        }
    }, [key]);

    // Save data effect
    useEffect(() => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;
            return;
        }

        if (!data) return;

        setIsSaving(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify({
                    data,
                    timestamp: new Date().toISOString()
                }));
                setLastSaved(new Date());
                setIsSaving(false);
            } catch (e) {
                console.error('Error auto-saving:', e);
                setIsSaving(false);
            }
        }, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [data, key, delay]);

    const clearSavedData = () => {
        localStorage.removeItem(key);
        setLastSaved(null);
    };

    return { lastSaved, isSaving, loadSavedData, clearSavedData };
};

export default useAutoSave;

import { useState, useEffect } from 'react';
import * as formFieldsService from '@/services/formFieldsService';

// Custom hook to fetch and cache form field options
export const useFormFieldOptions = () => {
    const [options, setOptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                const response = await formFieldsService.getAllFormFieldOptions();

                if (response.success) {
                    setOptions(response.data);
                } else {
                    throw new Error('Failed to load form options');
                }
            } catch (err) {
                console.error('Error fetching form field options:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { options, loading, error };
};

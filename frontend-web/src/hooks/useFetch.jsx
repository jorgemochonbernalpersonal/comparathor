import { useCallback } from 'react';

const BASE_URL = 'http://127.0.0.1:8000/api/v1'; 

export const useFetch = () => {
    const fetchData = useCallback(async (endpoint, method = 'GET', body = null, headers = {}) => {
        try {
            const defaultHeaders = {
                'Content-Type': 'application/json',
                ...headers,
            };

            const options = {
                method,
                headers: defaultHeaders,
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en la solicitud');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en fetchData:', error.message);
            throw error;
        }
    }, []);

    return { fetchData };
};

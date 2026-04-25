const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2020';

export async function proxy(endpoint: string | Request, options: RequestInit = {}) {
    if (typeof window === 'undefined') {
        return null;
    }

    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const targetUrl = typeof endpoint === 'string' 
        ? (endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`)
        : endpoint;

    try {
        const response = await fetch(targetUrl, {
            ...options,
            headers,
            cache: 'no-store'
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return response;
    } catch (error) {
        throw error;
    }
}
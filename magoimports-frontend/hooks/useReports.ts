import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:2020/reports';

export const useReports = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async <T>(path: string): Promise<T | null> => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}${path}`);
            if (!res.ok) return null;
            return await res.json() as T;
        } catch {
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSalesByStatusReport = useCallback(() => fetchData<any[]>('/sales/by-status'), [fetchData]);
    const fetchFullInventory = useCallback(() => fetchData<any>('/inventory/full'), [fetchData]);
    const fetchProcurementSuggested = useCallback(() => fetchData<any[]>('/procurement/suggested'), [fetchData]);
    const fetchProductPerformance = useCallback((start: string, end: string) => 
        fetchData<any>(`/products/performance?startDate=${start}&endDate=${end}`), [fetchData]);

    return {
        isLoading,
        fetchSalesByStatusReport,
        fetchFullInventory,
        fetchProcurementSuggested,
        fetchProductPerformance
    };
};
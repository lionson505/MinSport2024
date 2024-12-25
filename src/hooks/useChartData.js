import { useState, useEffect } from 'react';
import { getDashboardChartData, getReportChartData } from '../services/api';

export const useChartData = (type, filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result;

        if (type === 'dashboard') {
          result = await getDashboardChartData();
        } else {
          result = await getReportChartData(type, filters);
        }

        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, JSON.stringify(filters)]);

  return { data, loading, error };
}; 
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export function useVacancies(searchParams) {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  
  const abortControllerRef = useRef(null);

  const fetchVacancies = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        text: searchParams.query || '',
        area: searchParams.area || 113,  // ИСПРАВЛЕНО: используем area из searchParams
        page: page,
        per_page: 20,
        professional_role: 96, // 96 = Программист/Разработчик
        ...(searchParams.salary && { salary: searchParams.salary }),
        ...(searchParams.schedule && { schedule: searchParams.schedule })
      };
      
      console.log('📡 Отправляем запрос с параметрами:', params);
      
      const response = await axios.get('https://api.hh.ru/vacancies', { 
        params,
        signal: abortControllerRef.current.signal
      });
      
      setVacancies(response.data.items);
      setTotal(response.data.found);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  // добавили searchParams.area в зависимости
  }, [searchParams.query, searchParams.salary, searchParams.schedule, searchParams.area, page]);

  useEffect(() => {
    fetchVacancies();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchVacancies]);

  return { vacancies, loading, error, total, page, setPage };
}
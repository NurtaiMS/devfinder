import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useVacancies } from './hooks/useVacancies';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import './App.css';
import { ThemeToggle } from './components/ThemeToggle';
import logo from './DevFinder.png';

function App() {
  
const [showOnlyFavorites, setShowOnlyFavorites] = useLocalStorage('showOnlyFavorites', false);
const [showBishkek, setShowBishkek] = useLocalStorage('showBishkek', false);
const [searchQuery, setSearchQuery] = useLocalStorage('searchQuery', '');
const [filters, setFilters] = useLocalStorage('filters', {
  query: '',
  salary: '',
  schedule: ''
});
  
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const inputRef = useRef(null);
  
  // Обновляем filters при изменении выбора Бишкека
  useEffect(() => {
    setFilters(prev => ({ 
      ...prev, 
      area: showBishkek ? 1604 : 113  // 1604 = Бишкек, 113 = Россия
    }));
  }, [showBishkek]);
  
  // Наш кастомный хук
  const { vacancies, loading, error, total, page, setPage } = useVacancies(filters);
  
  // Автофокус на поиск
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Добавить/удалить из избранного
  const toggleFavorite = useCallback((vacancy) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === vacancy.id);
      if (exists) {
        return prev.filter(fav => fav.id !== vacancy.id);
      } else {
        return [...prev, vacancy];
      }
    });
  }, [setFavorites]);

  // Проверка, в избранном ли вакансия 
  const isFavorite = useCallback((id) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);
  
  // Статистика по языкам (useMemo)
  const stats = useMemo(() => {
    const langCount = {};
    
    vacancies.forEach(vacancy => {
      const name = vacancy.name.toLowerCase();
      const description = (vacancy.snippet?.requirement || '').toLowerCase();
      const text = name + ' ' + description;
      
      const languages = [
        { name: 'python', display: 'Python' },
        { name: 'javascript', display: 'JavaScript' },
        { name: 'java', display: 'Java' },
        { name: 'c#', display: 'C#' },
        { name: 'c++', display: 'C++' },
        { name: 'php', display: 'PHP' },
        { name: 'ruby', display: 'Ruby' },
        { name: 'go', display: 'Go' },
        { name: 'rust', display: 'Rust' },
        { name: 'typescript', display: 'TypeScript' },
        { name: 'react', display: 'React' },
        { name: 'django', display: 'Django' }
      ];
      
      languages.forEach(lang => {
        if (text.includes(lang.name)) {
          langCount[lang.display] = (langCount[lang.display] || 0) + 1;
        }
      });
    });
    
    return Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [vacancies]);
  
  // Фильтрация вакансий (только избранные)
  const displayedVacancies = useMemo(() => {
    if (!showOnlyFavorites) return vacancies;
    return vacancies.filter(vacancy => isFavorite(vacancy.id));
  }, [vacancies, showOnlyFavorites, isFavorite]);
  
  // Поиск с задержкой (debounce)
useEffect(() => {
  const timer = setTimeout(() => {
    setFilters(prev => ({ ...prev, query: searchQuery }));
    setPage(0);  // Сбрасываем страницу при поиске
  }, 500);
  
  return () => clearTimeout(timer);
}, [searchQuery, setPage]);

// Сброс страницы при изменении других фильтров
useEffect(() => {
  setPage(0);
}, [filters.salary, filters.schedule, showBishkek, setPage]);

  return (
    <div className="app">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="DevFinder" style={{ height: '70px' }} />
            <h1 style={{ margin: 0 }}>DevFinder</h1>
          </div>
          <ThemeToggle />
        </div>
        <p>Найди работу мечты в IT</p>
      </header>
      
      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Python, React, Java..."
          />
        </div>
        
        {stats.length > 0 && (
          <div className="stats">
            <h3>🔥 Сейчас в тренде:</h3>
            <div className="stats-bars">
              {stats.map(([lang, count], index) => (
                <div key={lang} className="stat-item">
                  <span>{lang}</span>
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${(count / stats[0][1]) * 100}%`,
                      background: index === 0 ? '#e74c3c' : '#3498db'
                    }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="filters" style={{ marginBottom: '15px' }}>
          <select onChange={(e) => setFilters(prev => ({ ...prev, schedule: e.target.value }))}>
            <option value="">График</option>
            <option value="fullDay">Полный день</option>
            <option value="remote">Удаленка</option>
            <option value="flexible">Гибкий</option>
          </select>
          
          <select onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}>
            <option value="">Зарплата</option>
            <option value="50000">от 50к</option>
            <option value="100000">от 100к</option>
            <option value="150000">от 150к</option>
          </select>
        </div>

        {/* Фильтр для избранного */}
        <div className="favorite-filter">
          <label className="favorite-checkbox">
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={(e) => setShowOnlyFavorites(e.target.checked)}
            />
            <span>⭐ Только избранное </span>
          </label>
          {showOnlyFavorites && (
            <span className= "favorite-count">
              {favorites.length} вакансий
            </span>
          )}
        </div>

        {/* Фильтр для Бишкека */}
        <div className="city-filter">
          <label className="city-checkbox">
            <input
              type="checkbox"
              checked={showBishkek}
              onChange={(e) => setShowBishkek(e.target.checked)}
            />
            <span> KG Только Бишкек</span>
          </label>
        </div>
      </div>
      
      {error && <div className="error">❌ {error}</div>}
      
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <>
          <div className="results-info">
            Найдено вакансий: {total}
          </div>

          {favorites.length > 0 && (
            <div className="favorites-section">
              <h2>⭐ Избранное</h2>
              <div className="favorites-list">
                {favorites.map(fav => (
                  <div key={fav.id} className="favorite-item">
                    <span>{fav.name}</span>
                    <span>{fav.employer?.name}</span>
                    <button onClick={() => toggleFavorite(fav)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="vacancies-list">
            {displayedVacancies.map(vacancy => (
              <div key={vacancy.id} className="vacancy-card">
                <div className="vacancy-header">
                  <h3>{vacancy.name}</h3>
                  <button 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(vacancy)}
                  >
                    {isFavorite(vacancy.id) ? <FaStar color="gold" /> : <FaRegStar />}
                  </button>
                </div>
                
                <div className="vacancy-company">
                  {vacancy.employer?.name}
                </div>
                
                {vacancy.salary && (
                  <div className="vacancy-salary">
                    {vacancy.salary.from && `от ${vacancy.salary.from}`}
                    {vacancy.salary.to && ` до ${vacancy.salary.to}`}
                    {vacancy.salary.currency === 'RUR' ? ' ₽' : ` ${vacancy.salary.currency}`}
                  </div>
                )}
                
                <div className="vacancy-meta">
                  <span>{vacancy.schedule?.name || 'Не указан'}</span>
                  <span>{vacancy.experience?.name || 'Без опыта'}</span>
                </div>
                
                <div className="vacancy-actions">
                  <a 
                    href={vacancy.alternate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Открыть на HH.ru
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {!showOnlyFavorites && total > 20 && (
            <div className="pagination">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                ← Назад
              </button>
              <span>Страница {page + 1}</span>
              <button 
                disabled={vacancies.length < 20}
                onClick={() => setPage(p => p + 1)}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
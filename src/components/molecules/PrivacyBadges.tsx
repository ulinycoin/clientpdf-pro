import React, { useState, useEffect } from 'react';

export interface PrivacyBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'privacy' | 'security' | 'performance' | 'trust';
  animated?: boolean;
}

export interface PrivacyBadgesProps {
  badges?: PrivacyBadge[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  showStats?: boolean;
  animated?: boolean;
  className?: string;
}

const defaultBadges: PrivacyBadge[] = [
  {
    id: 'local-processing',
    icon: '🛡️',
    title: '100% Приватно',
    description: 'Данные не покидают устройство',
    type: 'privacy',
    animated: true
  },
  {
    id: 'no-upload',
    icon: '📱',
    title: 'Без загрузки',
    description: 'Обработка в браузере',
    type: 'security',
    animated: true
  },
  {
    id: 'instant',
    icon: '⚡',
    title: 'Мгновенно',
    description: 'В 10x быстрее облака',
    type: 'performance',
    animated: true
  },
  {
    id: 'open-source',
    icon: '🔓',
    title: 'Открытый код',
    description: 'Прозрачные алгоритмы',
    type: 'trust'
  }
];

const PrivacyBadges: React.FC<PrivacyBadgesProps> = ({
  badges = defaultBadges,
  layout = 'horizontal',
  showStats = false,
  animated = true,
  className = ''
}) => {
  const [visibleBadges, setVisibleBadges] = useState<number>(0);
  const [currentHighlight, setCurrentHighlight] = useState<number>(0);
  const [userStats] = useState({
    totalUsers: 250000,
    filesProcessed: 2500000,
    timesSaved: 125000 // hours
  });

  // Progressive reveal animation
  useEffect(() => {
    if (animated) {
      const timer = setInterval(() => {
        setVisibleBadges(prev => {
          if (prev < badges.length) {
            return prev + 1;
          }
          return prev;
        });
      }, 300);

      return () => clearInterval(timer);
    } else {
      setVisibleBadges(badges.length);
    }
  }, [badges.length, animated]);

  // Cycling highlight effect
  useEffect(() => {
    if (animated && visibleBadges === badges.length) {
      const interval = setInterval(() => {
        setCurrentHighlight(prev => (prev + 1) % badges.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [badges.length, visibleBadges, animated]);

  const getBadgeTypeClasses = (type: PrivacyBadge['type']) => {
    switch (type) {
      case 'privacy':
        return 'bg-privacy-50 dark:bg-privacy-900 border-privacy-200 dark:border-privacy-700 text-privacy-700 dark:text-privacy-300';
      case 'security':
        return 'bg-seafoam-50 dark:bg-seafoam-900 border-seafoam-200 dark:border-seafoam-700 text-seafoam-700 dark:text-seafoam-300';
      case 'performance':
        return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300';
      case 'trust':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-3';
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
      default:
        return 'flex flex-wrap justify-center gap-3';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trust Statistics */}
      {showStats && (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-privacy-800 dark:text-privacy-200">
            Нам доверяют пользователи по всему миру
          </h3>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-seafoam-600 dark:text-seafoam-400">
                {formatNumber(userStats.totalUsers)}+
              </div>
              <div className="text-xs text-gray-600">Пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-seafoam-600 dark:text-seafoam-400">
                {formatNumber(userStats.filesProcessed)}+
              </div>
              <div className="text-xs text-gray-600">Файлов обработано</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-seafoam-600 dark:text-seafoam-400">
                {formatNumber(userStats.timesSaved)}ч
              </div>
              <div className="text-xs text-gray-600">Времени сэкономлено</div>
            </div>
          </div>
        </div>
      )}

      {/* Badges Container */}
      <div className={getLayoutClasses()}>
        {badges.map((badge, index) => {
          const isVisible = index < visibleBadges;
          const isHighlighted = animated && currentHighlight === index && visibleBadges === badges.length;
          
          return (
            <div
              key={badge.id}
              className={`
                inline-flex items-center gap-3 px-4 py-3 rounded-full border-2 
                transition-all duration-500 ease-out
                ${getBadgeTypeClasses(badge.type)}
                ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                ${isHighlighted ? 'scale-105 shadow-lg ring-2 ring-current ring-opacity-20' : ''}
                ${layout === 'grid' ? 'justify-center' : ''}
              `}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              {/* Icon with Animation */}
              <div className={`text-lg transition-transform duration-300 ${isHighlighted ? 'scale-125' : ''}`}>
                {badge.icon}
              </div>

              {/* Text Content */}
              <div className={`${layout === 'grid' ? 'text-center' : 'text-left'}`}>
                <div className="font-medium text-sm leading-tight">
                  {badge.title}
                </div>
                <div className="text-xs opacity-75">
                  {badge.description}
                </div>
              </div>

              {/* Pulse Animation for Highlighted Badge */}
              {isHighlighted && badge.animated && (
                <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-20"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Trust Indicators */}
      <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Без регистрации</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Работает офлайн</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Открытый исходный код</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span>GDPR совместимо</span>
        </div>
      </div>

      {/* Local Processing Visualization */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-seafoam-50 to-ocean-50 dark:from-seafoam-900/20 dark:to-ocean-900/20 rounded-full border border-seafoam-200 dark:border-seafoam-700">
          <div className="relative">
            {/* Device Icon */}
            <svg className="w-5 h-5 text-seafoam-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z" />
            </svg>
            {/* Processing Indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-seafoam-400 rounded-full animate-ping"></div>
          </div>
          
          <div className="text-sm font-medium text-seafoam-700 dark:text-seafoam-300">
            Обрабатывается на вашем устройстве
          </div>
          
          {/* Crossed Cloud */}
          <div className="relative opacity-60">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.5,20Q4.22,20 2.61,18.43Q1,16.85 1,14.58Q1,12.63 2.17,11.1Q3.35,9.57 5.25,9.15Q5.88,6.85 7.75,5.43Q9.63,4 12,4Q14.93,4 16.96,6.04Q19,8.07 19,11Q20.73,11.2 21.86,12.5Q23,13.78 23,15.5Q23,17.38 21.69,18.69Q20.38,20 18.5,20H6.5Z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-red-500 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyBadges;
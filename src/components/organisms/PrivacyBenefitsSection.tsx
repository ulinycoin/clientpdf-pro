import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '../../hooks/useI18n';
import { getToolsCount } from '../../utils/toolsData';

export interface PrivacyBenefitsSectionProps {
  animated?: boolean;
  className?: string;
  toolsCount?: number;
}

const PrivacyBenefitsSection: React.FC<PrivacyBenefitsSectionProps> = ({
  animated = true,
  className = '',
  toolsCount
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Dynamic tools count - always get current count from central source
  const actualToolsCount = useMemo(() => {
    return toolsCount || getToolsCount();
  }, [toolsCount]);

  // Intersection observer for reveal animation
  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  const benefits = [
    {
      icon: '🔒',
      title: t('home.privacyBenefits.benefits.privacy.title'),
      description: t('home.privacyBenefits.benefits.privacy.description'),
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: '⚡',
      title: t('home.privacyBenefits.benefits.speed.title'),
      description: t('home.privacyBenefits.benefits.speed.description'),
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: '🌐',
      title: t('home.privacyBenefits.benefits.offline.title'),
      description: t('home.privacyBenefits.benefits.offline.description'),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: '🆓',
      title: t('home.privacyBenefits.benefits.unlimited.title'),
      description: t('home.privacyBenefits.benefits.unlimited.description', { toolsCount: actualToolsCount }),
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 overflow-hidden ${className}`}
    >
      {/* Background with glassmorphism */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-seafoam-50/50 via-white/30 to-ocean-50/50 dark:from-privacy-950/50 dark:via-privacy-900/30 dark:to-ocean-950/50" />
        
        {/* Floating geometric shapes */}
        {animated && (
          <>
            <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-seafoam-300/20 to-ocean-300/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'smooth-reveal' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-seafoam-600 via-ocean-600 to-purple-600 bg-clip-text text-transparent">
{t('home.whyChooseTitle')}
            </span>
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
{t('home.whyChooseSubtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`
                group relative h-full
                ${isVisible ? 'smooth-reveal' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className={`
                relative h-full p-8 rounded-3xl overflow-hidden
                bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl
                border border-white/30 dark:border-gray-700/30
                shadow-lg shadow-black/5 dark:shadow-black/20
                hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30
                hover:scale-105 hover:-translate-y-2
                transition-all duration-500 ease-out
                ${benefit.bgColor}
              `}>
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color}
                    flex items-center justify-center text-2xl
                    shadow-lg group-hover:shadow-xl group-hover:scale-110
                    transition-all duration-300
                  `}>
                    <span className="text-white font-bold">{benefit.icon}</span>
                  </div>
                  
                  {/* Floating particles */}
                  {animated && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-seafoam-400 to-ocean-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: `${index * 0.5}s` }} />
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-seafoam-600 dark:group-hover:text-seafoam-400 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Hover gradient overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${benefit.color}
                  opacity-0 group-hover:opacity-5 transition-opacity duration-300
                  rounded-3xl
                `} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 ${isVisible ? 'smooth-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="
            inline-flex items-center gap-3 px-8 py-4
            bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60
            backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30
            shadow-lg hover:shadow-xl transition-all duration-300
          ">
            <div className="text-2xl">🚀</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('home.privacyBenefits.cta', { toolsCount: actualToolsCount })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyBenefitsSection;
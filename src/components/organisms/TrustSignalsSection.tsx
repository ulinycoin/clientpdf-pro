import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useI18n';

export interface TrustSignalsSectionProps {
  animated?: boolean;
  className?: string;
}

const TrustSignalsSection: React.FC<TrustSignalsSectionProps> = ({
  animated = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [countUpValues, setCountUpValues] = useState({ files: 0, users: 0, countries: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Intersection observer for reveal animation
  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      setCountUpValues({ files: 2000000, users: 50000, countries: 180 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Start count-up animation
          startCountUp();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  const startCountUp = () => {
    const targets = { files: 2000000, users: 50000, countries: 180 };
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCountUpValues({
        files: Math.floor(targets.files * progress),
        users: Math.floor(targets.users * progress),
        countries: Math.floor(targets.countries * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCountUpValues(targets);
      }
    }, increment);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return num.toString();
  };

  const trustSignals = [
    {
      icon: '📊',
      value: formatNumber(countUpValues.files),
      label: t('home.trustSignals.stats.filesProcessed'),
      description: t('home.trustSignals.stats.filesDescription'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '👥',
      value: formatNumber(countUpValues.users),
      label: t('home.trustSignals.stats.happyUsers'),
      description: t('home.trustSignals.stats.usersDescription'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🌍',
      value: countUpValues.countries.toString(),
      label: t('home.trustSignals.stats.countriesUsing'),
      description: t('home.trustSignals.stats.countriesDescription'),
      color: 'from-purple-500 to-pink-500'
    }
  ];


  const securityBadges = [
    { icon: '🔒', text: t('home.trustSignals.security.sslSecured') },
    { icon: '🛡️', text: t('home.trustSignals.security.gdprCompliant') },
    { icon: '⚡', text: t('home.trustSignals.security.localProcessing') },
    { icon: '🌐', text: t('home.trustSignals.security.openSource') }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 overflow-hidden ${className}`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950" />
        
        {/* Animated particles */}
        {animated && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'smooth-reveal' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-white">
            {t('home.trustSignals.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('home.trustSignals.subtitle')}
          </p>
        </div>

        {/* Trust Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
          {trustSignals.map((signal, index) => (
            <div
              key={index}
              className={`
                group text-center h-full
                ${isVisible ? 'smooth-reveal' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="
                relative p-8 rounded-3xl overflow-hidden h-full flex flex-col justify-center
                bg-white/10 backdrop-blur-xl border border-white/20
                shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20
                hover:scale-105 transition-all duration-500
              ">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Icon */}
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${signal.color}
                    flex items-center justify-center text-2xl
                    shadow-lg group-hover:scale-110 transition-transform duration-300
                  `}>
                    {signal.icon}
                  </div>

                  {/* Value */}
                  <div className="text-4xl sm:text-5xl font-black text-white">
                    {signal.value}
                  </div>

                  {/* Label */}
                  <div className="text-xl font-semibold text-gray-200">
                    {signal.label}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed text-center">
                    {signal.description}
                  </p>
                </div>

                {/* Hover gradient */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${signal.color}
                  opacity-0 group-hover:opacity-10 transition-opacity duration-300
                  rounded-3xl
                `} />
              </div>
            </div>
          ))}
        </div>


        {/* Security Badges */}
        <div className={`${isVisible ? 'smooth-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t('home.trustSignals.security.title')}
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {securityBadges.map((badge, index) => (
              <div
                key={index}
                className="
                  inline-flex items-center gap-2 px-6 py-3
                  bg-white/10 backdrop-blur-xl rounded-full
                  border border-white/20 hover:border-white/30
                  hover:scale-105 transition-all duration-300
                "
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-white font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
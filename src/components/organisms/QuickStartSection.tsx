import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useI18n';

export interface QuickStartSectionProps {
  animated?: boolean;
  className?: string;
}

const QuickStartSection: React.FC<QuickStartSectionProps> = ({
  animated = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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

  // Auto-cycle through steps
  useEffect(() => {
    if (animated && isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animated, isVisible]);

  const steps = [
    {
      number: '01',
      title: t('home.quickStart.steps.step1.title'),
      description: t('home.quickStart.steps.step1.description'),
      icon: '🎯',
      color: 'from-purple-500 to-indigo-600',
      preview: '🔍'
    },
    {
      number: '02',
      title: t('home.quickStart.steps.step2.title'),
      description: t('home.quickStart.steps.step2.description'),
      icon: '📁',
      color: 'from-blue-500 to-cyan-600',
      preview: '📄'
    },
    {
      number: '03',
      title: t('home.quickStart.steps.step3.title'),
      description: t('home.quickStart.steps.step3.description'),
      icon: '⬇️',
      color: 'from-green-500 to-emerald-600',
      preview: '✅'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 overflow-hidden ${className}`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900" />
        
        {/* Animated pattern */}
        {animated && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-seafoam-400 to-ocean-400 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'smooth-reveal' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              {t('home.quickStart.title')}
            </span>
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.quickStart.subtitle')}
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-300 via-blue-300 to-green-300 dark:from-purple-600 dark:via-blue-600 dark:to-green-600 transform -translate-y-1/2 z-0" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`
                  group relative
                  ${isVisible ? 'smooth-reveal' : 'opacity-0'}
                  ${activeStep === index ? 'scale-105' : 'hover:scale-105'}
                  transition-all duration-500 ease-out
                `}
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Step Card */}
                <div className={`
                  relative p-8 rounded-3xl overflow-hidden
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl
                  border-2 transition-all duration-500
                  ${activeStep === index 
                    ? 'border-seafoam-400 shadow-2xl shadow-seafoam-500/20' 
                    : 'border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl'
                  }
                `}>
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`
                      text-6xl font-black opacity-20 transition-opacity duration-300
                      ${activeStep === index ? 'opacity-30' : ''}
                    `}>
                      {step.number}
                    </div>
                    
                    {/* Interactive Icon */}
                    <div className={`
                      w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color}
                      flex items-center justify-center text-2xl text-white
                      shadow-lg transform transition-all duration-300
                      ${activeStep === index ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}
                    `}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Preview Animation */}
                  <div className="flex items-center justify-center">
                    <div className={`
                      w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700
                      flex items-center justify-center text-xl
                      transition-all duration-500
                      ${activeStep === index ? 'animate-bounce' : ''}
                    `}>
                      {step.preview}
                    </div>
                  </div>

                  {/* Active Step Overlay */}
                  {activeStep === index && (
                    <div className={`
                      absolute inset-0 bg-gradient-to-br ${step.color}
                      opacity-5 rounded-3xl transition-opacity duration-300
                    `} />
                  )}
                </div>

                {/* Connection Dot for Desktop */}
                <div className={`
                  hidden lg:block absolute top-1/2 -right-6 w-4 h-4 rounded-full
                  transform -translate-y-1/2 transition-all duration-300 z-20
                  ${activeStep === index 
                    ? 'bg-seafoam-500 scale-125 shadow-lg shadow-seafoam-500/50' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className={`
          mt-16 text-center grid grid-cols-1 sm:grid-cols-3 gap-8
          ${isVisible ? 'smooth-reveal' : 'opacity-0'}
        `} style={{ animationDelay: '0.8s' }}>
          {[
            { number: '<30s', label: t('home.quickStart.stats.averageTime') },
            { number: '0MB', label: t('home.quickStart.stats.dataSentToServers') },
            { number: '100%', label: t('home.quickStart.stats.privacyGuaranteed') }
          ].map((stat, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
            >
              <div className="text-3xl font-bold text-seafoam-600 dark:text-seafoam-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickStartSection;
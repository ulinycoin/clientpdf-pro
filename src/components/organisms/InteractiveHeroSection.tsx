import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../hooks/useI18n';

export interface InteractiveHeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  onGetStarted?: () => void;
  showStats?: boolean;
  animated?: boolean;
  className?: string;
}

const InteractiveHeroSection: React.FC<InteractiveHeroSectionProps> = ({
  title,
  subtitle,
  description,
  onGetStarted,
  showStats = true,
  animated = true,
  className = ''
}) => {
  const { t, translations } = useI18n();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  // Privacy-focused badges with real value propositions
  const badges = translations.home.hero.badges;

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  // Cycling badges
  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setCurrentBadgeIndex(prev => (prev + 1) % (badges?.length || 3));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <section 
      ref={heroRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient - transparent to inherit from parent */}
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Floating geometric shapes */}
        {animated && (
          <>
            {/* Large circle */}
            <div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-seafoam-200/20 to-ocean-200/20 rounded-full blur-3xl"
              style={{
                transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
                transition: 'transform 0.5s ease-out'
              }}
            />
            
            {/* Medium circle */}
            <div 
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-privacy-200/20 to-seafoam-200/20 rounded-full blur-2xl"
              style={{
                transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            />
            
            {/* Small floating elements */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-seafoam-400/30 rounded-full gentle-float`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + (i % 2)}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Animated title */}
          <h1 className={`
            text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6
            bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent
            ${isVisible ? 'smooth-reveal' : 'opacity-0'}
          `}>
            {title}
          </h1>

          {/* Subtitle */}
          <p className={`
            text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-200 mb-8
            ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
          `}>
            {subtitle}
          </p>

          {/* Description */}
          <p className={`
            text-lg sm:text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed
            ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
          `}>
            {description}
          </p>

          {/* Enhanced Privacy Benefits Card */}
          <div className={`
            group relative inline-block mb-12
            ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
          `}>
            <div className="
              relative px-8 py-6 rounded-2xl overflow-hidden
              bg-white/70 dark:bg-white/10 backdrop-blur-xl 
              border border-gray-200/50 dark:border-white/20
              shadow-lg shadow-black/10 hover:shadow-2xl hover:shadow-black/20
              hover:scale-105 transition-all duration-500 ease-out
            ">
              {/* Animated gradient background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-seafoam-400/20 via-ocean-400/20 to-seafoam-400/20 
                  animate-gradient-x"></div>
              </div>
              
              <div className="relative flex flex-col sm:flex-row items-center gap-4">
                <div className={`text-3xl transition-all duration-500 ${animated ? 'animate-pulse' : ''}`} 
                     key={currentBadgeIndex}>
                  {badges?.[currentBadgeIndex]?.icon || '🔒'}
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {badges?.[currentBadgeIndex]?.title || 'Private & Secure'}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {badges?.[currentBadgeIndex]?.description || 'All processing happens locally'}
                  </div>
                </div>
                
                {animated && (
                  <div className="flex space-x-2 ml-auto">
                    {badges?.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          i === currentBadgeIndex 
                            ? 'bg-seafoam-500 scale-125 shadow-lg shadow-seafoam-500/50' 
                            : 'bg-gray-400 dark:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Button - Centered */}
          <div className="flex justify-center mb-16">
            <button
              onClick={() => {
                if (onGetStarted) {
                  onGetStarted();
                } else {
                  // Smooth scroll to tools section
                  const toolsSection = document.querySelector('[data-section="tools"]');
                  if (toolsSection) {
                    toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className={`
                group relative inline-flex items-center gap-3 px-8 py-4
                bg-gradient-to-r from-seafoam-500 to-ocean-500 text-white font-bold text-xl
                rounded-2xl shadow-lg shadow-seafoam-500/25 hover:shadow-xl hover:shadow-seafoam-500/40
                hover:scale-105 active:scale-95 transform transition-all duration-300 ease-out
                border border-white/20 backdrop-blur-sm
                ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
              `}
            >
              <span className="relative z-10">{t('home.hero.getStarted')}</span>
              <svg 
                className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-ocean-600 to-seafoam-600 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>



          {/* Scroll indicator */}
          {animated && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
                <span className="text-sm mb-2">{t('home.hero.learnMore')}</span>
                <svg 
                  className="w-6 h-6 animate-bounce" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive particles on mouse move */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-1 h-1 bg-seafoam-500 rounded-full opacity-60"
            style={{
              left: `${50 + mousePosition.x * 10}%`,
              top: `${50 + mousePosition.y * 10}%`,
              transition: 'all 0.1s ease-out'
            }}
          />
          <div 
            className="absolute w-0.5 h-0.5 bg-ocean-500 rounded-full opacity-40"
            style={{
              left: `${30 + mousePosition.x * -8}%`,
              top: `${70 + mousePosition.y * -8}%`,
              transition: 'all 0.15s ease-out'
            }}
          />
        </div>
      )}
    </section>
  );
};

export default InteractiveHeroSection;
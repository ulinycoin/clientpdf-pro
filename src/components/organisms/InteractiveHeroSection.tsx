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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center">
          {/* Animated title */}
          <h1 className={`
            text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6
            bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent
            ${isVisible ? 'smooth-reveal' : 'opacity-0'}
            leading-tight px-2
          `}>
            {title}
          </h1>

          {/* Subtitle */}
          <p className={`
            text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-600 dark:text-gray-200 mb-8
            ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
            px-2
          `}>
            {subtitle}
          </p>

          {/* Description */}
          <p className={`
            text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed
            ${isVisible ? 'smooth-reveal staggered-reveal' : 'opacity-0'}
            px-4
          `}>
            {description}
          </p>


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
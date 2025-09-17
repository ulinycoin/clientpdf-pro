import React from 'react';
import { ArrowLeft, Home, FileText, Settings } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import Button from '../atoms/Button';

interface MobileToolNavigationProps {
  title: string;
  currentStep?: string;
  totalSteps?: number;
  currentStepIndex?: number;
  onBack?: () => void;
  onHome?: () => void;
  onSettings?: () => void;
  showProgress?: boolean;
  className?: string;
}

const MobileToolNavigation: React.FC<MobileToolNavigationProps> = ({
  title,
  currentStep,
  totalSteps,
  currentStepIndex = 0,
  onBack,
  onHome,
  onSettings,
  showProgress = true,
  className = ''
}) => {
  const { t } = useI18n();

  return (
    <div className={`bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Back Button */}
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 -ml-2"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                {title}
              </h1>
              {currentStep && (
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {currentStep}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="p-2"
              aria-label={t('common.settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          
          {onHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onHome}
              className="p-2"
              aria-label={t('common.home')}
            >
              <Home className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {showProgress && totalSteps && totalSteps > 1 && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              {t('common.step')} {currentStepIndex + 1} {t('common.of')} {totalSteps}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileToolNavigation;
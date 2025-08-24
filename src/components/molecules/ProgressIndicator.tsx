import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import ProgressBar from '../atoms/ProgressBar';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentProgress?: number;
  showProgressBar?: boolean;
  className?: string;
  compact?: boolean;
  estimatedTime?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentProgress = 0,
  showProgressBar = true,
  className = '',
  compact = false,
  estimatedTime
}) => {
  const { t } = useI18n();

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepStyles = (status: ProgressStep['status']) => {
    const baseStyles = 'flex items-center space-x-3 p-3 rounded-lg transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-50 border border-green-200`;
      case 'active':
        return `${baseStyles} bg-blue-50 border border-blue-200 shadow-sm`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200`;
      default:
        return `${baseStyles} bg-gray-50 border border-gray-200 opacity-60`;
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {showProgressBar && (
          <ProgressBar
            progress={currentProgress || overallProgress}
            size="md"
            color="blue"
            animated={currentProgress > 0 && currentProgress < 100}
            showPercentage={true}
            label={steps.find(s => s.status === 'active')?.title || t('common.processing')}
          />
        )}
        
        {estimatedTime && currentProgress > 0 && currentProgress < 100 && (
          <div className="text-sm text-gray-600 text-center">
            {t('common.estimatedTime')}: {estimatedTime}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showProgressBar && (
        <div className="mb-6">
          <ProgressBar
            progress={currentProgress || overallProgress}
            size="lg"
            color="blue"
            animated={currentProgress > 0 && currentProgress < 100}
            showPercentage={true}
            label={t('common.progress')}
          />
          
          {estimatedTime && currentProgress > 0 && currentProgress < 100 && (
            <div className="text-sm text-gray-600 text-center mt-2">
              {t('common.estimatedTime')}: {estimatedTime}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className={getStepStyles(step.status)}>
            <div className="flex-shrink-0">
              {getStepIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`
                  font-medium text-sm
                  ${step.status === 'active' ? 'text-blue-900' : ''}
                  ${step.status === 'completed' ? 'text-green-900' : ''}
                  ${step.status === 'error' ? 'text-red-900' : ''}
                  ${step.status === 'pending' ? 'text-gray-700' : ''}
                `}>
                  {step.title}
                </h4>
                
                <span className="text-xs text-gray-500 ml-2">
                  {index + 1}/{totalSteps}
                </span>
              </div>
              
              {step.description && (
                <p className={`
                  text-xs mt-1
                  ${step.status === 'active' ? 'text-blue-700' : ''}
                  ${step.status === 'completed' ? 'text-green-700' : ''}
                  ${step.status === 'error' ? 'text-red-700' : ''}
                  ${step.status === 'pending' ? 'text-gray-500' : ''}
                `}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">
            {t('common.progress')}: {completedSteps}/{totalSteps} {t('common.steps')}
          </span>
          <span className="text-gray-500">
            {Math.round(overallProgress)}% {t('common.complete')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
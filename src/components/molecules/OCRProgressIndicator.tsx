import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Brain, 
  Zap, 
  Image, 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Eye,
  Cpu
} from 'lucide-react';
import ProgressBar from '../atoms/ProgressBar';

export interface OCRProgressStage {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  estimatedDuration: number; // in seconds
}

export interface OCRProgressData {
  stage: string;
  progress: number;
  status: string;
  currentPage?: number;
  totalPages?: number;
  estimatedTimeRemaining?: number;
  processingSpeed?: number; // pages per minute
  qualityMetrics?: {
    confidence: number;
    wordsDetected: number;
    languageDetected: string;
  };
}

interface OCRProgressIndicatorProps {
  progress: OCRProgressData;
  showDetailedMetrics?: boolean;
  showEstimatedTime?: boolean;
  showQualityMetrics?: boolean;
  className?: string;
}

// Predefined OCR processing stages
const OCR_STAGES: Record<string, OCRProgressStage> = {
  'initializing': {
    id: 'initializing',
    name: 'Initializing',
    icon: Cpu,
    color: 'blue',
    description: 'Loading OCR engine and language models',
    estimatedDuration: 10
  },
  'preprocessing': {
    id: 'preprocessing',
    name: 'Preprocessing',
    icon: Image,
    color: 'purple',
    description: 'Enhancing image quality for better recognition',
    estimatedDuration: 5
  },
  'recognizing': {
    id: 'recognizing',
    name: 'Recognizing',
    icon: Brain,
    color: 'green',
    description: 'Extracting text using AI-powered OCR',
    estimatedDuration: 20
  },
  'analyzing': {
    id: 'analyzing',
    name: 'Analyzing',
    icon: Eye,
    color: 'orange',
    description: 'Analyzing text structure and confidence',
    estimatedDuration: 3
  },
  'generating': {
    id: 'generating',
    name: 'Generating',
    icon: FileText,
    color: 'indigo',
    description: 'Creating output document with searchable text',
    estimatedDuration: 7
  },
  'complete': {
    id: 'complete',
    name: 'Complete',
    icon: CheckCircle,
    color: 'green',
    description: 'Processing completed successfully',
    estimatedDuration: 0
  }
};

const OCRProgressIndicator: React.FC<OCRProgressIndicatorProps> = ({
  progress,
  showDetailedMetrics = true,
  showEstimatedTime = true,
  showQualityMetrics = true,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress.progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.progress]);

  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentStage = OCR_STAGES[progress.stage] || OCR_STAGES['recognizing'];
  const StageIcon = currentStage.icon;

  // Calculate estimated time remaining
  const estimatedRemaining = progress.estimatedTimeRemaining || 
    Math.max(0, currentStage.estimatedDuration - elapsedTime);

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate processing speed
  const processingSpeed = progress.processingSpeed || 
    (progress.currentPage && elapsedTime > 0 ? 
      (progress.currentPage / (elapsedTime / 60)) : 0);

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-${currentStage.color}-100 text-${currentStage.color}-600`}>
            <StageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{currentStage.name}</h3>
            <p className="text-sm text-gray-600">{currentStage.description}</p>
          </div>
        </div>

        {showEstimatedTime && (
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              {estimatedRemaining > 0 ? `~${formatTime(estimatedRemaining)} left` : 'Almost done'}
            </div>
            <div className="text-xs text-gray-400">
              Elapsed: {formatTime(elapsedTime)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {progress.status}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(animatedProgress)}%
          </span>
        </div>
        
        <ProgressBar
          progress={animatedProgress}
          className="h-3 bg-gray-200 rounded-full"
          color={currentStage.color}
          animated={true}
        />
      </div>

      {/* Page Progress (for multi-page documents) */}
      {progress.currentPage && progress.totalPages && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Processing page {progress.currentPage} of {progress.totalPages}
            </span>
            {processingSpeed > 0 && (
              <span className="text-gray-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {processingSpeed.toFixed(1)} pages/min
              </span>
            )}
          </div>
          
          <div className="mt-2">
            <ProgressBar
              progress={(progress.currentPage / progress.totalPages) * 100}
              className="h-2 bg-gray-300 rounded"
              color="blue"
            />
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      {showQualityMetrics && progress.qualityMetrics && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.qualityMetrics.confidence.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress.qualityMetrics.wordsDetected}
            </div>
            <div className="text-xs text-gray-500">Words Found</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-600 uppercase">
              {progress.qualityMetrics.languageDetected}
            </div>
            <div className="text-xs text-gray-500">Language</div>
          </div>
        </div>
      )}

      {/* Detailed Processing Metrics */}
      {showDetailedMetrics && progress.stage === 'recognizing' && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Processing Details</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Memory Usage:</span>
              <span className="font-medium">Optimized</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Engine:</span>
              <span className="font-medium">Tesseract.js v6</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Worker Threads:</span>
              <span className="font-medium">Active</span>
            </div>
            
            {processingSpeed > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Speed:</span>
                <span className="font-medium text-green-600">
                  {processingSpeed > 5 ? 'Fast' : processingSpeed > 2 ? 'Normal' : 'Careful'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Navigation (Visual representation of all stages) */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          {Object.values(OCR_STAGES).slice(0, -1).map((stage, index) => {
            const isCompleted = Object.keys(OCR_STAGES).indexOf(progress.stage) > index;
            const isCurrent = stage.id === progress.stage;
            const StageIcon = stage.icon;
            
            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center space-y-1 ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-75' : 'opacity-40'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600'
                      : isCurrent
                      ? `bg-${stage.color}-100 text-${stage.color}-600`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <StageIcon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs text-gray-500 text-center">{stage.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Status Messages */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Real-time Processing</div>
            <div className="text-blue-600">
              {progress.stage === 'initializing' && 'Loading optimized language models...'}
              {progress.stage === 'preprocessing' && 'Enhancing image quality and reducing noise...'}
              {progress.stage === 'recognizing' && 'AI analyzing text patterns and characters...'}
              {progress.stage === 'analyzing' && 'Validating text structure and confidence scores...'}
              {progress.stage === 'generating' && 'Creating searchable document with embedded text...'}
              {progress.stage === 'complete' && 'Ready for download!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRProgressIndicator;
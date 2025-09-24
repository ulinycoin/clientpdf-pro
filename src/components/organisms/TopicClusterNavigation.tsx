// src/components/organisms/TopicClusterNavigation.tsx
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { entityHelper, TOPIC_CLUSTERS } from '@/utils/entityHelpers';
import { useI18n } from '@/hooks/useI18n';

interface TopicClusterNavigationProps {
  currentTool?: string;
  maxClusters?: number;
  showProgress?: boolean;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'grid';
}

interface ClusterProgress {
  clusterId: string;
  completedTools: string[];
  totalTools: number;
  progressPercentage: number;
}

export const TopicClusterNavigation: React.FC<TopicClusterNavigationProps> = ({
  currentTool,
  maxClusters = 4,
  showProgress = true,
  className = "",
  variant = 'grid'
}) => {
  const { currentLanguage } = useI18n();
  const { entity } = useEntity();
  const location = useLocation();

  // Get topic clusters with progress calculation
  const clustersWithProgress = useMemo((): ClusterProgress[] => {
    return Object.values(TOPIC_CLUSTERS)
      .slice(0, maxClusters)
      .map(cluster => {
        // Simulate progress based on user activity (in real app, this would come from analytics)
        const completedTools = cluster.primaryTools.filter(tool => {
          // Check if user has used this tool (placeholder logic)
          return localStorage.getItem(`tool-used-${tool}`) === 'true';
        });

        return {
          clusterId: cluster.id,
          completedTools: completedTools,
          totalTools: cluster.primaryTools.length,
          progressPercentage: (completedTools.length / cluster.primaryTools.length) * 100
        };
      });
  }, [maxClusters]);

  // Get current cluster based on current tool or entity
  const currentCluster = useMemo(() => {
    if (currentTool) {
      return Object.values(TOPIC_CLUSTERS).find(cluster =>
        cluster.primaryTools.includes(currentTool)
      );
    }
    if (entity) {
      return Object.values(TOPIC_CLUSTERS).find(cluster =>
        cluster.primaryEntity === entity || cluster.relatedEntities.includes(entity)
      );
    }
    return null;
  }, [currentTool, entity]);

  const getClusterIcon = (clusterId: string): string => {
    const icons = {
      'pdf-management': '📁',
      'pdf-security': '🔒',
      'pdf-conversion': '🔄',
      'pdf-optimization': '⚡'
    };
    return icons[clusterId as keyof typeof icons] || '📄';
  };

  const getClusterColor = (clusterId: string): string => {
    const colors = {
      'pdf-management': 'from-blue-500 to-blue-600',
      'pdf-security': 'from-green-500 to-green-600',
      'pdf-conversion': 'from-purple-500 to-purple-600',
      'pdf-optimization': 'from-orange-500 to-orange-600'
    };
    return colors[clusterId as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getLayoutClasses = () => {
    switch (variant) {
      case 'horizontal':
        return 'flex space-x-4 overflow-x-auto';
      case 'vertical':
        return 'space-y-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    }
  };

  return (
    <section className={`topic-cluster-navigation ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          <SemanticContent
            entity={entity || 'LocalPDF'}
            context="heading"
            fallback="PDF Tool Categories"
            maxVariants={1}
          />
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          <SemanticContent
            entity={entity || 'LocalPDF'}
            context="description"
            fallback="Explore our comprehensive PDF processing capabilities organized by use case"
            maxVariants={1}
          />
        </p>
      </div>

      {/* Current Cluster Highlight */}
      {currentCluster && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getClusterIcon(currentCluster.id)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Currently in: {currentCluster.name}
              </h3>
              <p className="text-blue-700 dark:text-blue-200 text-sm">
                {currentCluster.localizedContent?.[currentLanguage]?.description ||
                 `Explore ${currentCluster.primaryTools.length} tools in this category`}
              </p>
            </div>
            <Link
              to={currentCluster.authorityPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      )}

      {/* Cluster Grid */}
      <div className={getLayoutClasses()}>
        {Object.values(TOPIC_CLUSTERS).slice(0, maxClusters).map((cluster) => {
          const progress = clustersWithProgress.find(p => p.clusterId === cluster.id);
          const isActive = currentCluster?.id === cluster.id;

          return (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              progress={progress}
              isActive={isActive}
              showProgress={showProgress}
              language={currentLanguage}
            />
          );
        })}
      </div>

      {/* Topic Authority Links */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comprehensive Guides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(TOPIC_CLUSTERS).map(cluster => (
            <Link
              key={`guide-${cluster.id}`}
              to={cluster.authorityPage}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-2xl">{getClusterIcon(cluster.id)}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cluster.name} Guide
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Complete reference for {cluster.primaryTools.length} tools
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Cluster Card Component
const ClusterCard: React.FC<{
  cluster: any;
  progress?: ClusterProgress;
  isActive: boolean;
  showProgress: boolean;
  language: string;
}> = ({ cluster, progress, isActive, showProgress, language }) => {
  const getClusterIcon = (clusterId: string): string => {
    const icons = {
      'pdf-management': '📁',
      'pdf-security': '🔒',
      'pdf-conversion': '🔄',
      'pdf-optimization': '⚡'
    };
    return icons[clusterId as keyof typeof icons] || '📄';
  };

  const getClusterColor = (clusterId: string): string => {
    const colors = {
      'pdf-management': 'from-blue-500 to-blue-600',
      'pdf-security': 'from-green-500 to-green-600',
      'pdf-conversion': 'from-purple-500 to-purple-600',
      'pdf-optimization': 'from-orange-500 to-orange-600'
    };
    return colors[clusterId as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
      }`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getClusterColor(cluster.id)} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getClusterIcon(cluster.id)}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{cluster.name}</h3>
            <p className="text-sm opacity-90">
              {cluster.primaryTools.length} tools
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {cluster.localizedContent?.[language]?.description ||
           cluster.semanticVariants.slice(0, 2).join(', ')}
        </p>

        {/* Progress Bar */}
        {showProgress && progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${getClusterColor(cluster.id)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tools List */}
        <div className="space-y-2 mb-4">
          {cluster.primaryTools.slice(0, 3).map((tool: string) => {
            const isCompleted = progress?.completedTools.includes(tool);
            const toolName = tool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase();

            return (
              <Link
                key={tool}
                to={`/${tool}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm group"
              >
                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {toolName}
                </span>
              </Link>
            );
          })}
          {cluster.primaryTools.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-4">
              +{cluster.primaryTools.length - 3} more tools
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={cluster.authorityPage}
          className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isActive ? 'Continue Learning' : 'Explore Category'}
        </Link>
      </div>
    </div>
  );
};

// Breadcrumb-style cluster navigation for pages
export const ClusterBreadcrumb: React.FC<{
  currentTool?: string;
  currentCluster?: string;
  className?: string;
}> = ({ currentTool, currentCluster, className = "" }) => {
  const cluster = currentCluster
    ? TOPIC_CLUSTERS[currentCluster]
    : currentTool
    ? Object.values(TOPIC_CLUSTERS).find(c => c.primaryTools.includes(currentTool))
    : null;

  if (!cluster) return null;

  const getClusterIcon = (clusterId: string): string => {
    const icons = {
      'pdf-management': '📁',
      'pdf-security': '🔒',
      'pdf-conversion': '🔄',
      'pdf-optimization': '⚡'
    };
    return icons[clusterId as keyof typeof icons] || '📄';
  };

  return (
    <nav className={`cluster-breadcrumb ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link
          to="/"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Home
        </Link>
        <span>/</span>
        <div className="flex items-center gap-1">
          <span>{getClusterIcon(cluster.id)}</span>
          <Link
            to={cluster.authorityPage}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {cluster.name}
          </Link>
        </div>
        {currentTool && (
          <>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {currentTool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase()}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default TopicClusterNavigation;
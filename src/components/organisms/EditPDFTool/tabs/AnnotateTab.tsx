import React from 'react';
import { useI18n } from '../../../../hooks/useI18n';

const AnnotateTab: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✏️</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('tools.edit.tabs.annotate')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Coming soon - Add text, shapes, and annotations to your PDF
        </p>
      </div>
    </div>
  );
};

export default AnnotateTab;

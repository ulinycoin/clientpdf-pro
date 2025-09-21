import React from 'react';
import { useTranslation } from '../../hooks/useI18n';

const ArchitectureDiagram: React.FC = () => {
  const { t } = useTranslation();

  const layers = [
    {
      name: t('docs.architecture.layers.presentation'),
      description: t('docs.architecture.layers.presentationDesc'),
      color: 'from-blue-500 to-cyan-500',
      icon: '🎨',
      components: ['React Components', 'Tailwind CSS', 'Glassmorphism']
    },
    {
      name: t('docs.architecture.layers.business'),
      description: t('docs.architecture.layers.businessDesc'),
      color: 'from-green-500 to-emerald-500',
      icon: '⚙️',
      components: ['PDF Services', 'File Processing', 'AI Features']
    },
    {
      name: t('docs.architecture.layers.data'),
      description: t('docs.architecture.layers.dataDesc'),
      color: 'from-purple-500 to-indigo-500',
      icon: '💾',
      components: ['Browser Storage', 'Local Processing', 'No Server Upload']
    }
  ];

  const technologies = [
    { name: 'React 18', icon: '⚛️', category: 'Frontend' },
    { name: 'TypeScript', icon: '📘', category: 'Language' },
    { name: 'Vite', icon: '⚡', category: 'Build Tool' },
    { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' },
    { name: 'pdf-lib', icon: '📄', category: 'PDF Core' },
    { name: 'pdfjs-dist', icon: '🔍', category: 'PDF Rendering' },
    { name: 'tesseract.js', icon: '👁️', category: 'OCR' },
    { name: 'React Router', icon: '🛣️', category: 'Routing' }
  ];

  return (
    <div className="space-y-8">
      {/* Architecture Overview */}
      <div>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          {t('docs.architecture.description')}
        </p>

        {/* Layer Diagram */}
        <div className="relative">
          <div className="space-y-4">
            {layers.map((layer, index) => (
              <div key={index} className="relative">
                <div className={`
                  bg-gradient-to-r ${layer.color} p-6 rounded-xl text-white shadow-lg
                  transform hover:scale-105 transition-all duration-300
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-4">{layer.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold">{layer.name}</h3>
                        <p className="text-white/80 text-sm">{layer.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {layer.components.map((component, idx) => (
                      <span
                        key={idx}
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {component}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connection Arrow */}
                {index < layers.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full" />
                    <div className="absolute top-2 w-2 h-2 bg-gray-500 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('docs.architecture.techStack.title')}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200 text-center"
            >
              <div className="text-2xl mb-2">{tech.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {tech.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {tech.category}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('docs.architecture.dataFlow.title')}
        </h3>

        <div className="bg-white/5 dark:bg-gray-800/5 p-6 rounded-xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: t('docs.architecture.dataFlow.upload'),
                description: t('docs.architecture.dataFlow.uploadDesc'),
                icon: '📁',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '2',
                title: t('docs.architecture.dataFlow.process'),
                description: t('docs.architecture.dataFlow.processDesc'),
                icon: '⚙️',
                color: 'from-green-500 to-emerald-500'
              },
              {
                step: '3',
                title: t('docs.architecture.dataFlow.manipulate'),
                description: t('docs.architecture.dataFlow.manipulateDesc'),
                icon: '🔧',
                color: 'from-orange-500 to-yellow-500'
              },
              {
                step: '4',
                title: t('docs.architecture.dataFlow.download'),
                description: t('docs.architecture.dataFlow.downloadDesc'),
                icon: '⬇️',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className={`
                    w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${step.color}
                    rounded-full flex items-center justify-center text-white text-2xl shadow-lg
                  `}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-xs font-bold text-white">{step.step}</span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 text-center">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600">
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-gray-500 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Architecture */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
        <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4 flex items-center">
          <span className="mr-3 text-2xl">🔒</span>
          {t('docs.architecture.privacy.title')}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {t('docs.architecture.privacy.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('docs.architecture.privacy.noUpload')}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('docs.architecture.privacy.localProcessing')}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('docs.architecture.privacy.gdprCompliant')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
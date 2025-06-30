import ToolCard from './ToolCard'

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
  comingSoon?: boolean
  disabled?: boolean
}

interface ToolsGridProps {
  onToolSelect: (toolId: string) => void
  className?: string
}

const ToolsGrid = ({ onToolSelect, className = '' }: ToolsGridProps) => {
  const tools: Tool[] = [
    {
      id: 'merge',
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single document with custom page ordering.',
      icon: 'merge',
      features: [
        'Drag & drop to reorder pages',
        'Merge unlimited files',
        'Preview before merging',
        'Maintain original quality'
      ]
    },
    {
      id: 'split',
      title: 'Split PDF',
      description: 'Extract specific pages or split PDF into multiple documents.',
      icon: 'split',
      features: [
        'Split by page ranges',
        'Extract individual pages',
        'Bulk splitting options',
        'Preserve bookmarks'
      ],
      comingSoon: true
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality for easier sharing.',
      icon: 'compress',
      features: [
        'Smart compression',
        'Quality settings',
        'Batch compression',
        'Up to 90% size reduction'
      ],
      comingSoon: true
    },
    {
      id: 'rotate',
      title: 'Rotate Pages',
      description: 'Rotate PDF pages to the correct orientation individually or in bulk.',
      icon: 'rotate',
      features: [
        'Rotate individual pages',
        'Bulk rotation',
        '90° increments',
        'Preview changes'
      ],
      comingSoon: true
    },
    {
      id: 'watermark',
      title: 'Add Watermark',
      description: 'Add text or image watermarks to protect your PDF documents.',
      icon: 'watermark',
      features: [
        'Text watermarks',
        'Image watermarks',
        'Transparency control',
        'Position settings'
      ],
      comingSoon: true
    },
    {
      id: 'unlock',
      title: 'Unlock PDF',
      description: 'Remove password protection from PDF files you own.',
      icon: 'unlock',
      features: [
        'Remove passwords',
        'Decrypt files',
        'Batch processing',
        'Secure processing'
      ],
      comingSoon: true
    }
  ]

  return (
    <div className={className}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          PDF Tools
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional PDF tools that work entirely in your browser. 
          No uploads, no downloads, complete privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            features={tool.features}
            onUseClick={() => onToolSelect(tool.id)}
            comingSoon={tool.comingSoon}
            disabled={tool.disabled}
          />
        ))}
      </div>

      {/* Info section */}
      <div className="mt-16 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔒 Privacy First
          </h3>
          <p className="text-blue-700">
            All PDF processing happens locally in your browser. Your files never leave your device, 
            ensuring complete privacy and security for your documents.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ToolsGrid
import Button from '../atoms/Button'
import Icon from '../atoms/Icon'

interface ToolCardProps {
  title: string
  description: string
  icon: string
  features: string[]
  onUseClick: () => void
  disabled?: boolean
  comingSoon?: boolean
  className?: string
}

const ToolCard = ({
  title,
  description,
  icon,
  features,
  onUseClick,
  disabled = false,
  comingSoon = false,
  className = ''
}: ToolCardProps) => {
  const isDisabled = disabled || comingSoon

  return (
    <div className={`
      relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md 
      transition-all duration-300 group overflow-hidden
      ${isDisabled ? 'opacity-75' : 'hover:border-blue-300 hover:-translate-y-1'}
      ${className}
    `}>
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className={`
            p-3 rounded-lg mr-4 transition-colors duration-300
            ${isDisabled 
              ? 'bg-gray-100' 
              : 'bg-blue-50 group-hover:bg-blue-100'
            }
          `}>
            <Icon 
              name={icon} 
              size="lg" 
              className={`
                transition-colors duration-300
                ${isDisabled 
                  ? 'text-gray-400' 
                  : 'text-blue-600 group-hover:text-blue-700'
                }
              `} 
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <Icon 
                name="check" 
                size="sm" 
                className="text-green-500 mr-2 flex-shrink-0" 
              />
              {feature}
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <Button
          onClick={onUseClick}
          variant={comingSoon ? 'secondary' : 'primary'}
          size="md"
          disabled={isDisabled}
          className="w-full"
        >
          {comingSoon ? 'Coming Soon' : 'Use Tool'}
        </Button>
      </div>

      {/* Hover Effect Gradient */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  )
}

export default ToolCard
import React from 'react';
import { Printer, Edit, Copy, MessageSquare, FileEdit, Eye, Users } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import type { ProtectionSettings } from '../../types/protect.types';

interface PermissionsPanelProps {
  permissions: ProtectionSettings['permissions'];
  onChange: (permissions: Partial<ProtectionSettings['permissions']>) => void;
  className?: string;
  showAdvanced?: boolean;
}

const PermissionItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  type?: 'checkbox' | 'select';
  selectValue?: string;
  selectOptions?: Array<{ value: string; label: string }>;
  onSelectChange?: (value: string) => void;
}> = ({ 
  icon, 
  title, 
  description, 
  checked, 
  onChange, 
  type = 'checkbox',
  selectValue,
  selectOptions,
  onSelectChange
}) => (
  <div className="flex items-start space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-seafoam-500/20 to-ocean-500/20 rounded-lg flex items-center justify-center">
      <div className="text-seafoam-600 dark:text-seafoam-400">
        {icon}
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
            {description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {type === 'select' && selectOptions ? (
            <select
              value={selectValue}
              onChange={(e) => onSelectChange?.(e.target.value)}
              className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:ring-2 focus:ring-seafoam-500 focus:border-transparent"
            >
              {selectOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => onChange(!checked)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ${
                checked 
                  ? 'bg-seafoam-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                  checked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const PermissionsPanel: React.FC<PermissionsPanelProps> = ({
  permissions,
  onChange,
  className = '',
  showAdvanced = false
}) => {
  const { t } = useI18n();
  const handlePrintingChange = (value: string) => {
    onChange({ printing: value as ProtectionSettings['permissions']['printing'] });
  };

  const basicPermissions = [
    {
      key: 'printing',
      icon: <Printer className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionPrinting'),
      description: t('pages.tools.protect.permissionPrintingDesc'),
      type: 'select' as const,
      selectValue: permissions.printing,
      selectOptions: [
        { value: 'none', label: t('pages.tools.protect.printingNone') },
        { value: 'lowResolution', label: t('pages.tools.protect.printingLow') },
        { value: 'highResolution', label: t('pages.tools.protect.printingHigh') }
      ],
      onSelectChange: handlePrintingChange
    },
    {
      key: 'copying',
      icon: <Copy className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionCopying'),
      description: t('pages.tools.protect.permissionCopyingDesc'),
      checked: permissions.copying,
      onChange: (checked: boolean) => onChange({ copying: checked })
    },
    {
      key: 'modifying',
      icon: <Edit className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionModifying'),
      description: t('pages.tools.protect.permissionModifyingDesc'),
      checked: permissions.modifying,
      onChange: (checked: boolean) => onChange({ modifying: checked })
    }
  ];

  const advancedPermissions = [
    {
      key: 'annotating',
      icon: <MessageSquare className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionAnnotating'),
      description: t('pages.tools.protect.permissionAnnotatingDesc'),
      checked: permissions.annotating,
      onChange: (checked: boolean) => onChange({ annotating: checked })
    },
    {
      key: 'fillingForms',
      icon: <FileEdit className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionFillingForms'),
      description: t('pages.tools.protect.permissionFillingFormsDesc'),
      checked: permissions.fillingForms,
      onChange: (checked: boolean) => onChange({ fillingForms: checked })
    },
    {
      key: 'documentAssembly',
      icon: <Users className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionDocumentAssembly'),
      description: t('pages.tools.protect.permissionDocumentAssemblyDesc'),
      checked: permissions.documentAssembly,
      onChange: (checked: boolean) => onChange({ documentAssembly: checked })
    },
    {
      key: 'contentAccessibility',
      icon: <Eye className="w-5 h-5" />,
      title: t('pages.tools.protect.permissionContentAccessibility'),
      description: t('pages.tools.protect.permissionContentAccessibilityDesc'),
      checked: permissions.contentAccessibility,
      onChange: (checked: boolean) => onChange({ contentAccessibility: checked })
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t('pages.tools.protect.documentRestrictions')}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t('pages.tools.protect.permissionsDesc')}
        </p>
        
        {/* Basic Permissions */}
        <div className="space-y-3">
          {basicPermissions.map((permission) => (
            <PermissionItem
              key={permission.key}
              icon={permission.icon}
              title={permission.title}
              description={permission.description}
              checked={permission.checked || false}
              onChange={permission.onChange || (() => {})}
              type={permission.type}
              selectValue={permission.selectValue}
              selectOptions={permission.selectOptions}
              onSelectChange={permission.onSelectChange}
            />
          ))}
        </div>

        {/* Advanced Permissions */}
        {showAdvanced && (
          <div className="space-y-3 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              {t('pages.tools.protect.advancedPermissions')}
            </h4>
            
            {advancedPermissions.map((permission) => (
              <PermissionItem
                key={permission.key}
                icon={permission.icon}
                title={permission.title}
                description={permission.description}
                checked={permission.checked}
                onChange={permission.onChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {t('pages.tools.protect.securityNoteTitle')}
            </h5>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              {t('pages.tools.protect.securityNoteDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
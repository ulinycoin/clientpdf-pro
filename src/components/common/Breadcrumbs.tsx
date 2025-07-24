import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const getAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    if (pathSegments.length > 0) {
      const currentPath = pathSegments[0];

      // Tool names mapping for better UX
      const toolLabels: Record<string, string> = {
        'merge-pdf': 'Merge PDF',
        'split-pdf': 'Split PDF',
        'compress-pdf': 'Compress PDF',
        'add-text-pdf': 'Add Text to PDF',
        'watermark-pdf': 'Add Watermark',
        'rotate-pdf': 'Rotate PDF',
        'extract-pages-pdf': 'Extract Pages',
        'extract-text-pdf': 'Extract Text',
        'pdf-to-image': 'PDF to Image',
        'images-to-pdf': 'Images to PDF',
        'ocr-pdf': 'OCR Text Recognition',
        'privacy': 'Privacy Policy',
        'faq': 'FAQ',
        'how-to-use': 'How to Use'
      };

      if (toolLabels[currentPath]) {
        breadcrumbs.push({
          label: toolLabels[currentPath],
          current: true
        });
      } else {
        // Fallback for unknown paths
        const formattedLabel = currentPath
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbs.push({
          label: formattedLabel,
          current: true
        });
      }
    }

    return breadcrumbs;
  };

  // Use custom items if provided, otherwise generate automatically
  const breadcrumbs = items || getAutoBreadcrumbs();

  // Don't show breadcrumbs on homepage if auto-generating
  if (!items && location.pathname === '/') {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-6 ${className}`}
      role="navigation"
    >
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {(crumb.path || crumb.href) && !crumb.current ? (
              <Link
                to={crumb.path || crumb.href || '/'}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                aria-label={`Go to ${crumb.label}`}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className="text-gray-900 font-semibold"
                aria-current={crumb.current ? "page" : undefined}
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

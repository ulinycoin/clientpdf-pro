/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */


// 1. Создать компонент Breadcrumbs
// src/components/molecules/Breadcrumbs.tsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav 
      className={clsx('flex', className)} 
      aria-label="Breadcrumb"
      itemScope 
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="flex items-center space-x-1 md:space-x-3">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <div className="flex items-center">
            <a 
              href="/" 
              className="text-gray-400 hover:text-gray-500"
              itemProp="item"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
              <meta itemProp="name" content="Home" />
            </a>
            <meta itemProp="position" content="1" />
          </div>
        </li>
        
        {items.map((item, index) => (
          <li 
            key={index}
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.current ? (
                <span 
                  className="ml-1 text-sm font-medium text-gray-900 md:ml-2"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700 md:ml-2"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </a>
              )}
              <meta itemProp="position" content={String(index + 2)} />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};


import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export const FAQ: React.FC<FAQProps> = ({ items, className }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div 
      className={clsx('space-y-4', className)}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Frequently Asked Questions
      </h2>
      
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg"
          itemScope
          itemType="https://schema.org/Question"
        >
          <button
            className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            onClick={() => toggleItem(index)}
            aria-expanded={openItems.has(index)}
          >
            <span 
              className="font-medium text-gray-900"
              itemProp="name"
            >
              {item.question}
            </span>
            {openItems.has(index) ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {openItems.has(index) && (
            <div 
              className="px-6 pb-4"
              itemScope
              itemType="https://schema.org/Answer"
            >
              <div 
                className="text-gray-700 leading-relaxed"
                itemProp="text"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
  defaultOpen?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title = "Frequently Asked Questions",
  faqs,
  className = "",
  defaultOpen = false
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [sectionOpen, setSectionOpen] = useState(defaultOpen);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const toggleSection = () => {
    setSectionOpen(!sectionOpen);
  };

  const isOpen = (id: string) => openItems.has(id);

  return (
    <section className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6">
        {/* Collapsible section header */}
        <button
          onClick={toggleSection}
          className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={sectionOpen}
        >
          <h2 className="text-2xl font-semibold text-gray-900">
            {title}
          </h2>
          {sectionOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
          )}
        </button>

        {/* FAQ items - only show when section is open */}
        {sectionOpen && (
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-expanded={isOpen(faq.id)}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {isOpen(faq.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {isOpen(faq.id) && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-4 pt-2"
                  >
                    <div
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;

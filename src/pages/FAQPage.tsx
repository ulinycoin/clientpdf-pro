import React, { useState, useMemo } from 'react';
import { ModernHeader, ModernFooter } from '../components/organisms';
import { useTranslation, useI18n } from '../hooks/useI18n';
import { SEOHead } from '../components/SEO/SEOHead';
import { Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQQuestion {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedTools?: string[];
  relatedPages?: string[];
  popular?: boolean;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: FAQQuestion[];
}

const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Generate multilingual canonical URL
  const canonicalUrl = currentLanguage === 'en'
    ? 'https://localpdf.online/faq'
    : `https://localpdf.online/${currentLanguage}/faq`;

  // Get categories data
  const categories: FAQCategory[] = useMemo(() => {
    const faqCategories = t('pages.faq.categories') as any;
    return Object.values(faqCategories);
  }, [t]);

  // Get popular questions
  const popularQuestions = useMemo(() => {
    return categories
      .flatMap(cat => cat.questions)
      .filter(q => q.popular)
      .slice(0, 5);
  }, [categories]);

  // Search filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      questions: category.questions.filter(q =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    })).filter(cat => cat.questions.length > 0);
  }, [categories, searchQuery]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Generate FAQ Schema.org structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": categories.flatMap(category =>
      category.questions.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer.replace(/<[^>]*>/g, '') // Strip HTML for schema
        }
      }))
    )
  };

  const renderAnswer = (answer: string) => {
    return <div dangerouslySetInnerHTML={{ __html: answer }} className="prose prose-blue max-w-none" />;
  };

  const renderRelatedLinks = (question: FAQQuestion) => {
    const hasRelated = (question.relatedTools && question.relatedTools.length > 0) ||
                       (question.relatedPages && question.relatedPages.length > 0);

    if (!hasRelated) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          📌 Related:
        </p>
        <div className="flex flex-wrap gap-2">
          {question.relatedTools?.map(tool => (
            <Link
              key={tool}
              to={currentLanguage === 'en' ? tool : `/${currentLanguage}${tool}`}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {tool.replace('/', '').replace('-', ' ').toUpperCase()}
            </Link>
          ))}
          {question.relatedPages?.map(page => (
            <Link
              key={page}
              to={currentLanguage === 'en' ? page : `/${currentLanguage}${page}`}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {page.replace('/', '')}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title={`${t('pages.faq.title')} - LocalPDF | Privacy-First PDF Tools`}
        description={t('pages.faq.subtitle')}
        canonical={canonicalUrl}
        ogType="website"
        structuredData={faqSchema}
        includeHreflang={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ModernHeader />

        <main className="flex-grow">
          <div className="max-w-5xl mx-auto px-4 py-16">

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                {t('pages.faq.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                {t('pages.faq.subtitle')}
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('pages.faq.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Popular Questions */}
            {!searchQuery && popularQuestions.length > 0 && (
              <section className="mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ⭐ {t('pages.faq.popular.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('pages.faq.popular.subtitle')}
                  </p>
                </div>

                <div className="grid gap-4">
                  {popularQuestions.map((question) => (
                    <div
                      key={question.id}
                      id={question.id}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700/50 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                            {question.question}
                          </h3>
                        </div>
                        {expandedQuestions.has(question.id) ? (
                          <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      {expandedQuestions.has(question.id) && (
                        <div className="px-6 pb-6">
                          <div className="text-blue-800 dark:text-blue-200 leading-relaxed">
                            {renderAnswer(question.answer)}
                          </div>
                          {renderRelatedLinks(question)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {filteredCategories.length > 0 ? (
              <div className="space-y-8">
                {filteredCategories.map((category) => (
                  <section key={category.id} id={category.id}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                      {/* Category Header */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">{category.icon}</span>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category.title}
                          </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-14">
                          {category.description}
                        </p>
                      </div>

                      {/* Questions */}
                      <div className="space-y-3">
                        {category.questions.map((question) => (
                          <div
                            key={question.id}
                            id={question.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                          >
                            <button
                              onClick={() => toggleQuestion(question.id)}
                              className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                                {question.question}
                              </h3>
                              {expandedQuestions.has(question.id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                              )}
                            </button>

                            {expandedQuestions.has(question.id) && (
                              <div className="px-5 pb-5 pt-0">
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {renderAnswer(question.answer)}
                                </div>
                                {renderRelatedLinks(question)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  {t('pages.faq.searchNoResults')}
                </p>
                <a
                  href="mailto:support@localpdf.online"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('pages.faq.searchContactLink')}
                </a>
              </div>
            )}

            {/* Related Links */}
            {!searchQuery && (
              <section className="mt-16">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700/50">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {t('pages.faq.relatedLinks.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    {t('pages.faq.relatedLinks.subtitle')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(t('pages.faq.relatedLinks.links') as any).map(([key, link]: [string, any]) => (
                      <Link
                        key={key}
                        to={currentLanguage === 'en' ? link.url : `/${currentLanguage}${link.url}`}
                        className="flex items-start gap-4 p-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-purple-200 dark:border-purple-700 hover:bg-white dark:hover:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                      >
                        <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {link.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Contact Section */}
            {!searchQuery && (
              <section className="mt-12">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                      📧 {t('pages.faq.contact.title')}
                    </h2>
                    <p className="text-blue-100">
                      {t('pages.faq.contact.description')}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-1">Company:</p>
                        <p className="text-blue-100">{t('pages.faq.contact.company')}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Registration:</p>
                        <p className="text-blue-100">{t('pages.faq.contact.regNumber')}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Support Email:</p>
                        <a
                          href={`mailto:${t('pages.faq.contact.email')}`}
                          className="text-blue-100 hover:text-white underline transition-colors"
                        >
                          {t('pages.faq.contact.email')}
                        </a>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Contact Email:</p>
                        <a
                          href={`mailto:${t('pages.faq.contact.emailContact')}`}
                          className="text-blue-100 hover:text-white underline transition-colors"
                        >
                          {t('pages.faq.contact.emailContact')}
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap justify-center gap-4">
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('pages.faq.contact.github')}
                      </a>
                      <a
                        href="https://localpdf.online"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('pages.faq.contact.website')}
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default FAQPage;

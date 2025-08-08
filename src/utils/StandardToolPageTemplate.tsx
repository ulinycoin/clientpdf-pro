/**
 * Стандартный шаблон для страниц инструментов LocalPDF
 * Основан на ExcelToPDFPage как эталон
 */
import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEO/SEOHead';
import { Header, Footer } from '../components/organisms';
import { Breadcrumbs } from '../components/common';
import { RelatedTools } from '../components/common';
import FAQSection from '../components/common/FAQSection';
import { toolsSEOData } from '../data/seoData';
import { useTranslation, useI18n } from '../hooks/useI18n';
import { getTranslatedFAQs } from '../data/faqTranslations';

interface StandardToolPageProps {
  toolKey: string; // например: 'merge', 'split', 'compress'
  ToolComponent: React.ComponentType<any>;
  relatedToolKey?: string; // для RelatedTools, по умолчанию = toolKey
}

/**
 * СТАНДАРТНАЯ СТРУКТУРА СТРАНИЦЫ ИНСТРУМЕНТА:
 *
 * 1. SEO HEAD - метатеги, схема FAQ, структурированные данные
 * 2. HEADER - навигация сайта
 * 3. MAIN CONTENT:
 *    - Breadcrumbs (хлебные крошки)
 *    - Page Title & Description (заголовок и описание)
 *    - Tool Component (основной инструмент)
 *    - How-to Section (как использовать - 3 шага)
 *    - Features Section (преимущества - 4 блока в 2x2 сетке)
 *    - FAQ Section (часто задаваемые вопросы)
 *    - Related Tools (связанные инструменты)
 * 4. FOOTER - подвал сайта
 */

export const StandardToolPageTemplate: React.FC<StandardToolPageProps> = ({
  toolKey,
  ToolComponent,
  relatedToolKey = toolKey
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const seoData = toolsSEOData[toolKey];

  // Get FAQ data for SEO schema and display
  const faqs = getTranslatedFAQs(toolKey, currentLanguage);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbItems = [
    { label: t('common.home'), href: '/' },
    { label: t(`tools.${toolKey}.title`), href: `/${toolKey}` }
  ];

  return (
    <>
      {/* SEO HEAD */}
      <SEOHead
        title={seoData?.title}
        description={seoData?.description}
        keywords={seoData?.keywords}
        canonical={seoData?.canonical}
        structuredData={seoData?.structuredData}
        faqSchema={faqs?.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))}
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        {/* HEADER */}
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          {/* BREADCRUMBS */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* PAGE TITLE & DESCRIPTION */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              <span className="text-gradient-blue">{t(`tools.${toolKey}.title`)}</span>
            </h1>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              {t(`tools.${toolKey}.pageDescription`)}
            </p>
          </div>

          {/* TOOL COMPONENT */}
          <ToolComponent />

          {/* HOW-TO SECTION */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t(`tools.${toolKey}.howTo.title`)}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{t(`tools.${toolKey}.howTo.steps.upload.icon`) || '📤'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.howTo.steps.upload.title`)}</h3>
                  <p className="text-gray-600 text-sm">
                    {t(`tools.${toolKey}.howTo.steps.upload.description`)}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{t(`tools.${toolKey}.howTo.steps.configure.icon`) || '⚙️'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.howTo.steps.configure.title`)}</h3>
                  <p className="text-gray-600 text-sm">
                    {t(`tools.${toolKey}.howTo.steps.configure.description`)}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{t(`tools.${toolKey}.howTo.steps.download.icon`) || '📥'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.howTo.steps.download.title`)}</h3>
                  <p className="text-gray-600 text-sm">
                    {t(`tools.${toolKey}.howTo.steps.download.description`)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURES SECTION */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t(`tools.${toolKey}.features.title`)}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Feature 1 - Privacy */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.features.privacy.title`)}</h3>
                    <p className="text-gray-600 text-sm">{t(`tools.${toolKey}.features.privacy.description`)}</p>
                  </div>
                </div>

                {/* Feature 2 - Fast */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.features.fast.title`)}</h3>
                    <p className="text-gray-600 text-sm">{t(`tools.${toolKey}.features.fast.description`)}</p>
                  </div>
                </div>

                {/* Feature 3 - Quality/Compatibility */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.features.quality.title`)}</h3>
                    <p className="text-gray-600 text-sm">{t(`tools.${toolKey}.features.quality.description`)}</p>
                  </div>
                </div>

                {/* Feature 4 - Free */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🆓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t(`tools.${toolKey}.features.free.title`)}</h3>
                    <p className="text-gray-600 text-sm">{t(`tools.${toolKey}.features.free.description`)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ SECTION */}
          {faqs && faqs.length > 0 && (
            <FAQSection
              title={t(`tools.${toolKey}.faqTitle`)}
              faqs={faqs}
              className="mb-8"
              defaultOpen={false}
            />
          )}

          {/* RELATED TOOLS */}
          <RelatedTools currentTool={relatedToolKey} />
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
};

/**
 * СТАНДАРТНАЯ СТРУКТУРА ПЕРЕВОДОВ ДЛЯ ИНСТРУМЕНТА:
 *
 * tools.{toolKey}: {
 *   title: string;                    // Название инструмента
 *   description: string;              // Короткое описание для карточки
 *   pageDescription: string;          // Описание на странице
 *
 *   seo: {
 *     title: string;
 *     description: string;
 *     keywords: string;
 *   };
 *
 *   breadcrumbs: {
 *     home: string;
 *     [toolKey]: string;
 *   };
 *
 *   howTo: {
 *     title: string;                  // "Как использовать..."
 *     steps: {
 *       upload: {
 *         title: string;
 *         description: string;
 *         icon?: string;              // опционально
 *       };
 *       configure: {
 *         title: string;
 *         description: string;
 *         icon?: string;              // опционально
 *       };
 *       download: {
 *         title: string;
 *         description: string;
 *         icon?: string;              // опционально
 *       };
 *     };
 *   };
 *
 *   features: {
 *     title: string;                  // "Почему выбрать наш..."
 *     privacy: {
 *       title: string;
 *       description: string;
 *     };
 *     fast: {
 *       title: string;
 *       description: string;
 *     };
 *     quality: {                      // или compatible, multiFormat и т.д.
 *       title: string;
 *       description: string;
 *     };
 *     free: {
 *       title: string;
 *       description: string;
 *     };
 *   };
 *
 *   faqTitle: string;                 // "Часто задаваемые вопросы"
 * }
 */

export default StandardToolPageTemplate;

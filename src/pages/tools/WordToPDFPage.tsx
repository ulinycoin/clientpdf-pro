import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { WordToPDFTool } from '../../features/word-to-pdf';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const WordToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.wordToPdf;

  // Get FAQ data for SEO schema
  const wordToPdfFAQs = getCombinedFAQs('word-to-pdf');

  // Dynamic SEO updates
  useDynamicSEO('word-to-pdf');

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="word-to-pdf"
      faqSchema={wordToPdfFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle="Конвертировать Word в PDF бесплатно"
      pageDescription="Преобразуйте документы DOCX, DOC в PDF формат. Сохраните оригинальное форматирование, быстро и безопасно."
      toolComponent={<WordToPDFTool />}
      breadcrumbKey="word-to-pdf"
    />
  );
};

export default WordToPDFPage;

import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const ExcelToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.excelToPdf;

  // Get FAQ data for SEO schema
  const excelToPdfFAQs = getCombinedFAQs('excel-to-pdf');

  // Dynamic SEO updates
  useDynamicSEO('excel-to-pdf');

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="excel-to-pdf"
      faqSchema={excelToPdfFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle="Конвертировать Excel в PDF бесплатно"
      pageDescription="Преобразуйте таблицы Excel (XLS, XLSX) в PDF документы. Сохраните форматирование и макет таблиц."
      toolComponent={<ExcelToPDFTool />}
      breadcrumbKey="excel-to-pdf"
    />
  );
};

export default ExcelToPDFPage;

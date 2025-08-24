import React from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import ImageToPDFToolWrapper from '../../components/organisms/ImageToPDFToolWrapper';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const ImageToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.imagesToPdf;

  // Get FAQ data for SEO schema
  const imageToPDFFAQs = getCombinedFAQs('images-to-pdf');

  // Dynamic SEO updates
  useDynamicSEO('images-to-pdf');

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="images-to-pdf"
      faqSchema={imageToPDFFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle="Конвертировать изображения в PDF бесплатно"
      pageDescription="Преобразуйте JPEG, PNG, GIF и другие изображения в PDF документы. Быстро, безопасно, без загрузок на сервер."
      toolComponent={<ImageToPDFToolWrapper />}
      breadcrumbKey="images-to-pdf"
    />
  );
};

export default ImageToPDFPage;

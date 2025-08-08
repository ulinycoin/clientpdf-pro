/**
 * Стандартизированная страница Split PDF
 * Использует StandardToolPageTemplate для единообразной структуры
 */
import React from 'react';
import { StandardToolPageTemplate } from '../../utils/StandardToolPageTemplate';
import SplitPDFToolWrapper from '../../components/organisms/SplitPDFToolWrapper';

const SplitPDFPageStandardized: React.FC = () => {
  return (
    <StandardToolPageTemplate
      toolKey="split"
      ToolComponent={SplitPDFToolWrapper}
    />
  );
};

export default SplitPDFPageStandardized;

/**
 * Стандартизированная страница Split PDF
 * Использует StandardToolPageTemplate для единообразной структуры
 */
import React from 'react';
import { StandardToolPageTemplate } from '../../utils/StandardToolPageTemplate';
import SplitToolWrapper from '../../components/organisms/SplitToolWrapper';

const SplitPDFPageStandardized: React.FC = () => {
  return (
    <StandardToolPageTemplate
      toolKey="split"
      ToolComponent={SplitToolWrapper}
    />
  );
};

export default SplitPDFPageStandardized;

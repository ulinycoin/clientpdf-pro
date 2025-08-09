/**
 * Стандартизированная страница Split PDF
 * Использует StandardToolPageTemplate для единообразной структуры
 */
import React from 'react';
import { StandardToolPageTemplate } from '../../utils/StandardToolPageTemplate';
import SplitTool from '../../components/organisms/SplitTool';

const SplitPDFPageStandardized: React.FC = () => {
  return (
    <StandardToolPageTemplate
      toolKey="split"
      ToolComponent={SplitTool}
    />
  );
};

export default SplitPDFPageStandardized;

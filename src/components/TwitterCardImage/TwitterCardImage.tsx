import React from 'react';
import { useI18n } from '../../hooks/useI18n';

interface TwitterCardImageProps {
  toolId: string;
  language?: string;
  customImage?: string;
}

export const TwitterCardImage: React.FC<TwitterCardImageProps> = ({
  toolId,
  language,
  customImage
}) => {
  const { currentLanguage: currentLang } = useI18n();
  const currentLanguage = language || currentLang || 'en';
  
  // Generate Twitter Card image URL
  const getTwitterCardUrl = () => {
    if (customImage) {
      return customImage;
    }
    
    // Check if generated card exists (with twitter-card prefix)
    const generatedCard = `https://localpdf.online/twitter-cards/twitter-card-${toolId}-${currentLanguage}.png`;
    
    // Fallback to default card
    const fallbackCard = `https://localpdf.online/twitter-cards/twitter-card-${toolId}-en.png`;
    
    return currentLanguage === 'en' ? generatedCard : fallbackCard;
  };

  const twitterImageUrl = getTwitterCardUrl();

  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={twitterImageUrl} />
      <meta name="twitter:image:alt" content={`LocalPDF ${toolId} tool - Privacy-first PDF processing`} />
      
      {/* Also add to Open Graph for better compatibility */}
      <meta property="og:image" content={twitterImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`LocalPDF ${toolId} tool - Privacy-first PDF processing`} />
    </>
  );
};

export default TwitterCardImage;
import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TwitterCardGeneratorProps {
  toolId: string;
  language: string;
  gradient: 'blue' | 'purple' | 'green';
  onGenerate?: (dataUrl: string) => void;
}

// Custom geometric icons instead of emoji for better rendering
const drawToolIcon = (ctx: CanvasRenderingContext2D, toolId: string, centerX: number, centerY: number) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 6;
  
  switch (toolId) {
    case 'merge-pdf':
      // Two rectangles merging into one
      ctx.fillRect(centerX - 30, centerY - 25, 25, 35);
      ctx.fillRect(centerX + 5, centerY - 25, 25, 35);
      ctx.beginPath();
      ctx.moveTo(centerX - 2, centerY - 10);
      ctx.lineTo(centerX + 8, centerY);
      ctx.lineTo(centerX - 2, centerY + 10);
      ctx.stroke();
      break;
      
    case 'split-pdf':
      // Rectangle splitting with arrows
      ctx.fillRect(centerX - 20, centerY - 25, 40, 35);
      ctx.beginPath();
      ctx.moveTo(centerX - 5, centerY - 35);
      ctx.lineTo(centerX - 15, centerY - 25);
      ctx.lineTo(centerX - 5, centerY - 15);
      ctx.moveTo(centerX + 5, centerY - 35);
      ctx.lineTo(centerX + 15, centerY - 25);
      ctx.lineTo(centerX + 5, centerY - 15);
      ctx.stroke();
      break;
      
    case 'compress-pdf':
      // Arrows pointing inward
      ctx.fillRect(centerX - 15, centerY - 20, 30, 25);
      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY);
      ctx.lineTo(centerX - 25, centerY - 8);
      ctx.lineTo(centerX - 25, centerY + 8);
      ctx.moveTo(centerX + 35, centerY);
      ctx.lineTo(centerX + 25, centerY - 8);
      ctx.lineTo(centerX + 25, centerY + 8);
      ctx.fill();
      break;
      
    case 'pdf-to-jpg':
      // Document with image symbol
      ctx.fillRect(centerX - 20, centerY - 25, 30, 35);
      ctx.beginPath();
      ctx.arc(centerX + 15, centerY - 10, 12, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 15, centerY - 10, 4, 0, 2 * Math.PI);
      ctx.fill();
      break;
      
    case 'word-to-pdf':
      // W → PDF
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('W', centerX - 15, centerY + 8);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX + 5, centerY - 5);
      ctx.lineTo(centerX + 10, centerY);
      ctx.lineTo(centerX + 5, centerY + 5);
      ctx.stroke();
      ctx.fillText('P', centerX + 20, centerY + 8);
      break;
      
    case 'excel-to-pdf':
      // Grid → PDF
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(centerX - 25 + i * 12, centerY - 15 + j * 10, 8, 6);
        }
      }
      ctx.beginPath();
      ctx.moveTo(centerX + 5, centerY);
      ctx.lineTo(centerX + 15, centerY);
      ctx.moveTo(centerX + 10, centerY - 5);
      ctx.lineTo(centerX + 15, centerY);
      ctx.lineTo(centerX + 10, centerY + 5);
      ctx.stroke();
      ctx.fillRect(centerX + 20, centerY - 10, 15, 20);
      break;
      
    default:
      // Default PDF icon
      ctx.fillRect(centerX - 15, centerY - 20, 30, 35);
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PDF', centerX, centerY + 3);
  }
};

const GRADIENTS = {
  blue: ['#667eea', '#764ba2'],
  purple: ['#a855f7', '#3b82f6'],
  green: ['#10b981', '#059669']
};

export const TwitterCardGenerator: React.FC<TwitterCardGeneratorProps> = ({
  toolId,
  language,
  gradient,
  onGenerate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t, i18n } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Change language for translation
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const generateCard = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size for Twitter Card
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradientColors = GRADIENTS[gradient];
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, gradientColors[0]);
    bgGradient.addColorStop(1, gradientColors[1]);
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 1200; i += 40) {
      for (let j = 0; j < 630; j += 40) {
        if ((i + j) % 80 === 0) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    // Get tool translations
    const toolData = t(`tools.${toolId.replace('-pdf', '')}`, { returnObjects: true }) as any;
    const title = toolData?.title || t(`tools.${toolId.replace('-pdf', '')}.title`) || toolId;
    const description = toolData?.description || t(`tools.${toolId.replace('-pdf', '')}.description`) || '';

    // Tool icon - custom geometric design
    const iconX = 80;
    const iconY = 140;
    const iconSize = 120;
    
    // Icon background circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw custom icon
    const centerX = iconX + iconSize/2;
    const centerY = iconY + iconSize/2;
    drawToolIcon(ctx, toolId, centerX, centerY);

    // Title
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    // Word wrap for title
    const maxTitleWidth = 800;
    const words = title.split(' ');
    let line = '';
    let y = 280;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxTitleWidth && n > 0) {
        ctx.fillText(line, 280, y);
        line = words[n] + ' ';
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 280, y);

    // Description
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    
    const maxDescWidth = 800;
    const descWords = description.split(' ');
    let descLine = '';
    let descY = y + 80;
    
    for (let n = 0; n < descWords.length && descY < 480; n++) {
      const testLine = descLine + descWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxDescWidth && n > 0) {
        ctx.fillText(descLine, 280, descY);
        descLine = descWords[n] + ' ';
        descY += 45;
      } else {
        descLine = testLine;
      }
    }
    if (descY < 480) {
      ctx.fillText(descLine, 280, descY);
    }

    // Privacy badge
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'left';
    
    const privacyText = '🔒 PRIVACY FIRST';
    const badgeWidth = ctx.measureText(privacyText).width + 40;
    const badgeHeight = 50;
    const badgeX = 80;
    const badgeY = 520;
    
    // Badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
    ctx.fill();
    
    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(privacyText, badgeX + 20, badgeY + 35);

    // LocalPDF.online logo
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('LocalPDF.online', 1120, 580);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 1196, 626);

    // Generate data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    if (onGenerate) {
      onGenerate(dataUrl);
    }

    setIsGenerating(false);
  };

  useEffect(() => {
    generateCard();
  }, [toolId, language, gradient]);

  return (
    <div className="twitter-card-generator">
      <canvas
        ref={canvasRef}
        style={{ 
          width: '600px', 
          height: '315px', 
          border: '1px solid #ccc',
          display: 'block',
          margin: '20px auto'
        }}
      />
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={generateCard}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Card'}
        </button>
      </div>
    </div>
  );
};

export default TwitterCardGenerator;
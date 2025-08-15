import React, { useState } from 'react';
import { ExternalLink, Eye, EyeOff, Maximize2 } from 'lucide-react';

interface FigmaEmbedProps {
  url: string;
  title?: string;
  compact?: boolean;
}

const FigmaEmbed: React.FC<FigmaEmbedProps> = ({ url, title, compact = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Извлекаем Figma file ID из URL
  const getFigmaEmbedUrl = (figmaUrl: string) => {
    const match = figmaUrl.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    
    const fileId = match[1];
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`;
  };

  const embedUrl = getFigmaEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-red-700 text-sm">Неверная ссылка на Figma</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {title || 'Figma Design'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title={isVisible ? 'Скрыть' : 'Показать'}
          >
            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
          {isVisible && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Полный экран"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Открыть в Figma"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Embed */}
      {isVisible && (
        <div className={`relative ${compact ? 'h-64' : 'h-96'} ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : ''}`}>
          {isFullscreen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={() => setIsFullscreen(false)} />
          )}
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title={title || 'Figma Design'}
          />
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FigmaEmbed;
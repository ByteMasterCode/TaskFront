import React from 'react';
import { ExternalLink, Github, FileText, Figma, Globe, ArrowRight } from 'lucide-react';
import { Link } from '../../utils/structuredComment';

interface LinksListProps {
  links: Link[];
  compact?: boolean;
}

const LinksList: React.FC<LinksListProps> = ({ links, compact = false }) => {
  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="h-3 w-3" />;
      case 'figma': return <div className="w-3 h-3 bg-purple-500 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">F</span></div>;
      case 'docs': return <FileText className="h-3 w-3" />;
      case 'internal': return <ArrowRight className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const getLinkColor = (type: string) => {
    switch (type) {
      case 'github': return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
      case 'figma': return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
      case 'docs': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
      case 'internal': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
  };

  if (links.length === 0) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-gray-700 flex items-center space-x-1">
        <ExternalLink className="h-3 w-3" />
        <span>Ссылки ({links.length})</span>
      </h5>
      <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${getLinkColor(link.type)}`}
          >
            {getLinkIcon(link.type)}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{link.title}</div>
              {link.description && (
                <div className="text-xs opacity-75 truncate">{link.description}</div>
              )}
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default LinksList;
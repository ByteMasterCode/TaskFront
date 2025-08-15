import React from 'react';
import {
  Code,
  Database,
  Palette,
  CheckCircle,
  AlertTriangle,
  Server,
  FileText,
  Download,
  Plus,
  Settings,
  X,
  Trash2,
  Globe,
  Smartphone,
  Monitor,
  Chrome,
  Zap,
  Shield,
  Activity,
  Clock,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Key,
  Star,
  TrendingUp,
  Award,
  Target,
  ExternalLink
} from 'lucide-react';
import {
  StructuredComment,
  ApiEndpoint,
  DatabaseChange,
  DatabaseField,
  DesignElement,
  QualityMetric,
  BrowserSupport,
  Link
} from '../../utils/structuredComment';
import FigmaEmbed from './FigmaEmbed';
import LinksList from './LinksList';

interface StructuredCommentRendererProps {
  comment: StructuredComment;
  compact?: boolean;
}

const StructuredCommentRenderer: React.FC<StructuredCommentRendererProps> = ({ 
  comment, 
  compact = false 
}) => {
  const renderApiSection = (endpoints: ApiEndpoint[]) => {
    const getMethodColor = (method: string) => {
      switch (method) {
        case 'GET': return 'bg-blue-500 text-white';
        case 'POST': return 'bg-emerald-500 text-white';
        case 'PUT': return 'bg-amber-500 text-white';
        case 'DELETE': return 'bg-red-500 text-white';
        case 'PATCH': return 'bg-purple-500 text-white';
        default: return 'bg-slate-500 text-white';
      }
    };

    const getMethodIcon = (method: string) => {
      switch (method) {
        case 'GET': return <Download className="h-3 w-3" />;
        case 'POST': return <Plus className="h-3 w-3" />;
        case 'PUT': return <Settings className="h-3 w-3" />;
        case 'DELETE': return <X className="h-3 w-3" />;
        case 'PATCH': return <FileText className="h-3 w-3" />;
        default: return <Code className="h-3 w-3" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'bg-emerald-100 text-emerald-700';
        case 'testing': return 'bg-amber-100 text-amber-700';
        case 'implemented': return 'bg-blue-100 text-blue-700';
        case 'failed': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
      }
    };

    return (
      <div className="space-y-2">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)} flex items-center space-x-1`}>
                    {getMethodIcon(endpoint.method)}
                    <span>{endpoint.method}</span>
                  </span>
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-xs">
                    {endpoint.path}
                  </code>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                  {endpoint.status}
                </span>
              </div>
              
              {endpoint.description && (
                <p className="text-xs text-gray-600 mb-2">{endpoint.description}</p>
              )}
              
              <div className="flex items-center space-x-3 text-xs">
                {endpoint.responseTime && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{endpoint.responseTime}ms</span>
                  </div>
                )}
                {endpoint.statusCode && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>HTTP {endpoint.statusCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDatabaseSection = (changes: DatabaseChange[]) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'CREATE': return 'bg-emerald-500 text-white';
        case 'UPDATE': return 'bg-blue-500 text-white';
        case 'DELETE': return 'bg-red-500 text-white';
        case 'INDEX': return 'bg-purple-500 text-white';
        case 'MIGRATION': return 'bg-amber-500 text-white';
        default: return 'bg-slate-500 text-white';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'CREATE': return <Plus className="h-3 w-3" />;
        case 'UPDATE': return <Settings className="h-3 w-3" />;
        case 'DELETE': return <Trash2 className="h-3 w-3" />;
        case 'INDEX': return <Zap className="h-3 w-3" />;
        case 'MIGRATION': return <Database className="h-3 w-3" />;
        default: return <Database className="h-3 w-3" />;
      }
    };

    const getFieldTypeIcon = (type: string) => {
      switch (type) {
        case 'string': return <Type className="h-3 w-3 text-blue-600" />;
        case 'number': return <Hash className="h-3 w-3 text-green-600" />;
        case 'boolean': return <ToggleLeft className="h-3 w-3 text-purple-600" />;
        case 'date': return <Calendar className="h-3 w-3 text-orange-600" />;
        case 'uuid': return <Key className="h-3 w-3 text-indigo-600" />;
        default: return <FileText className="h-3 w-3 text-gray-600" />;
      }
    };

    return (
      <div className="space-y-2">
        {changes.map((change) => (
          <div key={change.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(change.type)} flex items-center space-x-1`}>
                    {getTypeIcon(change.type)}
                    <span>{change.type}</span>
                  </span>
                  <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-xs flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>{change.table}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  change.status === 'applied' ? 'bg-emerald-100 text-emerald-700' :
                  change.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {change.status}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{change.description}</p>
              
              {change.fields && change.fields.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>Fields</span>
                    <span className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-xs">{change.fields.length}</span>
                  </h5>
                  <div className="space-y-1">
                    {change.fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-2 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          {getFieldTypeIcon(field.type)}
                          <span className="font-mono text-xs font-medium text-gray-800">{field.name}</span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 rounded">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {field.primary && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                              PK
                            </span>
                          )}
                          {field.foreign && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                              FK
                            </span>
                          )}
                          {!field.nullable && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                              NOT NULL
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDesignSection = (elements: DesignElement[]) => {
    const getBrowserData = (browser: string) => {
      const data = {
        chrome: { icon: <Chrome className="h-4 w-4" />, name: 'Chrome', color: 'from-blue-500 to-blue-600' },
        firefox: { icon: <Globe className="h-4 w-4" />, name: 'Firefox', color: 'from-orange-500 to-red-500' },
        safari: { icon: <Monitor className="h-4 w-4" />, name: 'Safari', color: 'from-gray-600 to-gray-700' },
        edge: { icon: <Globe className="h-4 w-4" />, name: 'Edge', color: 'from-blue-600 to-indigo-600' },
        mobile: { icon: <Smartphone className="h-4 w-4" />, name: 'Mobile', color: 'from-green-500 to-emerald-600' }
      };
      return data[browser] || { icon: <Globe className="h-4 w-4" />, name: browser, color: 'from-gray-500 to-gray-600' };
    };

    const getSupportStatus = (support: string) => {
      const statuses = {
        supported: { 
          emoji: '✅', 
          text: 'Full', 
          color: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
          ring: 'ring-emerald-200'
        },
        partial: { 
          emoji: '⚠️', 
          text: 'Partial', 
          color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          ring: 'ring-amber-200'
        },
        unsupported: { 
          emoji: '❌', 
          text: 'None', 
          color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
          ring: 'ring-red-200'
        }
      };
      return statuses[support] || { emoji: '❓', text: 'Unknown', color: 'bg-gray-500 text-white', ring: 'ring-gray-200' };
    };

    return (
      <div className="space-y-2">
        {elements.map((element) => (
          <div key={element.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{element.name}</h4>
                    <p className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                      <span>{element.type}</span>
                      {element.responsive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                          <Smartphone className="h-3 w-3 mr-1" />
                          Responsive
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                  element.status === 'implemented' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                  element.status === 'approved' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                  element.status === 'review' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                  'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                    {element.status}
                </span>
              </div>
              
              {/* Browser Support */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                    <Globe className="h-3 w-3 text-white" />
                  </div>
                  <span>Browser Compatibility</span>
                </h5>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(element.browserSupport).map(([browser, support]) => {
                    const browserData = getBrowserData(browser);
                    const supportStatus = getSupportStatus(support);
                    return (
                      <div key={browser} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-2 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm">
                        <div className="flex flex-col items-center space-y-2">
                          {/* Browser Icon */}
                          <div className={`w-8 h-8 bg-gradient-to-br ${browserData.color} rounded-lg flex items-center justify-center shadow-sm`}>
                            {browserData.icon}
                          </div>
                          
                          {/* Browser Name */}
                          <span className="text-xs font-medium text-gray-700">{browserData.name}</span>
                          
                          {/* Support Status */}
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">{supportStatus.emoji}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${supportStatus.color} shadow-sm`}>
                              {supportStatus.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQualitySection = (metrics: QualityMetric[]) => {
    const getMetricIcon = (name: string) => {
      if (name.toLowerCase().includes('speed') || name.toLowerCase().includes('performance') || name.toLowerCase().includes('загрузк')) {
        return { icon: <Zap className="h-5 w-5" />, color: 'from-yellow-500 to-orange-500' };
      }
      if (name.toLowerCase().includes('security') || name.toLowerCase().includes('безопасн')) {
        return { icon: <Shield className="h-5 w-5" />, color: 'from-blue-500 to-indigo-600' };
      }
      if (name.toLowerCase().includes('accessibility') || name.toLowerCase().includes('доступн')) {
        return { icon: <Activity className="h-5 w-5" />, color: 'from-purple-500 to-pink-500' };
      }
      if (name.toLowerCase().includes('seo')) {
        return { icon: <TrendingUp className="h-5 w-5" />, color: 'from-green-500 to-emerald-500' };
      }
      return { icon: <CheckCircle className="h-5 w-5" />, color: 'from-gray-500 to-gray-600' };
    };

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'good': return { 
          bg: 'bg-gradient-to-br from-emerald-500 to-green-600', 
          ring: 'ring-emerald-200',
          glow: 'shadow-emerald-200'
        };
        case 'warning': return { 
          bg: 'bg-gradient-to-br from-amber-500 to-orange-500', 
          ring: 'ring-amber-200',
          glow: 'shadow-amber-200'
        };
        case 'critical': return { 
          bg: 'bg-gradient-to-br from-red-500 to-pink-500', 
          ring: 'ring-red-200',
          glow: 'shadow-red-200'
        };
        default: return { 
          bg: 'bg-gradient-to-br from-gray-500 to-gray-600', 
          ring: 'ring-gray-200',
          glow: 'shadow-gray-200'
        };
      }
    };

    return (
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric) => {
          const iconData = getMetricIcon(metric.name);
          const statusStyle = getStatusStyle(metric.status);
          
          return (
            <div key={metric.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              {/* Icon */}
              <div className="relative mb-3">
                <div className={`w-12 h-12 mx-auto ${statusStyle.bg} rounded-xl flex items-center justify-center shadow-lg ${statusStyle.glow} ring-4 ${statusStyle.ring}`}>
                  <div className={`w-10 h-10 bg-gradient-to-br ${iconData.color} rounded-lg flex items-center justify-center text-white`}>
                    {iconData.icon}
                  </div>
                </div>
              </div>
              
              {/* Metric Name */}
              <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">{metric.name}</h4>
              
              {/* Value */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {metric.value}{metric.unit}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} text-white shadow-sm`}>
                  {metric.status === 'good' ? '✅ Good' : 
                   metric.status === 'warning' ? '⚠️ Warning' : 
                   metric.status === 'critical' ? '🚨 Critical' : '❓ Unknown'}
                </div>
              </div>
              
              {/* Benchmark */}
              {metric.benchmark && (
                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">
                    🎯 Target: <span className="font-semibold text-gray-800">{metric.benchmark}{metric.unit}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'api': return <Code className="h-3 w-3" />;
      case 'database': return <Database className="h-3 w-3" />;
      case 'design': return <Palette className="h-3 w-3" />;
      case 'quality': return <CheckCircle className="h-3 w-3" />;
      case 'deployment': return <Server className="h-3 w-3" />;
      case 'status': return <Activity className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'api': return 'bg-blue-50 border-blue-200';
      case 'database': return 'bg-purple-50 border-purple-200';
      case 'design': return 'bg-pink-50 border-pink-200';
      case 'quality': return 'bg-emerald-50 border-emerald-200';
      case 'deployment': return 'bg-amber-50 border-amber-200';
      case 'status': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <FileText className="h-3 w-3 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-1">
                <span>Report</span>
                <Star className="h-3 w-3 text-yellow-300" />
              </h3>
              <p className="text-xs text-white/80">
                by {comment.author} • {new Date(comment.timestamp).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
          <span className="bg-white/20 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>v{comment.version}</span>
          </span>
        </div>
      </div>

      {/* Sections */}
      {comment.sections.map((section, index) => (
        <div key={index} className={`${getSectionColor(section.type)} rounded-lg p-3 border`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              {getSectionIcon(section.type)}
            </div>
            <h4 className="font-medium text-gray-900 text-sm">{section.title}</h4>
          </div>
          
          <div>
            {section.type === 'api' && section.data.endpoints && renderApiSection(section.data.endpoints)}
            {section.type === 'database' && section.data.changes && renderDatabaseSection(section.data.changes)}
            {section.type === 'design' && section.data.elements && renderDesignSection(section.data.elements)}
            {section.type === 'quality' && section.data.metrics && renderQualitySection(section.data.metrics)}
            
            {/* Figma Embed for design sections */}
            {section.type === 'design' && section.data.figmaUrl && (
              <div className="mt-3">
                <FigmaEmbed url={section.data.figmaUrl} title={section.title} compact={compact} />
              </div>
            )}
            
            {section.type === 'notes' && section.data.text && (
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{section.data.text}</p>
              </div>
            )}
            {section.type === 'notes' && section.data.links && (
              <div className="mt-2">
                <LinksList links={section.data.links} />
              </div>
            )}
            
            {/* Global Links for any section */}
            {section.data.links && section.data.links.length > 0 && section.type !== 'notes' && (
              <div className="mt-3">
                <LinksList links={section.data.links} compact={compact} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StructuredCommentRenderer;
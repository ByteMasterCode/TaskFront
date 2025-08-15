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
    const getBrowserIcon = (browser: string) => {
      switch (browser) {
        case 'chrome': return <Chrome className="h-3 w-3" />;
        case 'firefox': return <Globe className="h-3 w-3" />;
        case 'safari': return <Monitor className="h-3 w-3" />;
        case 'edge': return <Globe className="h-3 w-3" />;
        case 'mobile': return <Smartphone className="h-3 w-3" />;
        default: return <Globe className="h-3 w-3" />;
      }
    };

    const getSupportColor = (support: string) => {
      switch (support) {
        case 'supported': return 'text-emerald-700 bg-emerald-50';
        case 'partial': return 'text-amber-700 bg-amber-50';
        case 'unsupported': return 'text-red-700 bg-red-50';
        default: return 'text-gray-700 bg-gray-50';
      }
    };

    const getSupportEmoji = (support: string) => {
      switch (support) {
        case 'supported': return '✅';
        case 'partial': return '⚠️';
        case 'unsupported': return '❌';
        default: return '❓';
      }
    };

    return (
      <div className="space-y-2">
        {elements.map((element) => (
          <div key={element.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
                    <Palette className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{element.name}</h4>
                    <p className="text-xs text-gray-600 capitalize">{element.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {element.responsive && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      📱
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    element.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
                    element.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    element.status === 'review' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {element.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Browser Support</span>
                </h5>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(element.browserSupport).map(([browser, support]) => (
                    <div key={browser} className={`rounded p-1 text-center border ${getSupportColor(support)}`}>
                      <div className="flex flex-col items-center space-y-1">
                        {getBrowserIcon(browser)}
                        <span className="text-xs font-medium capitalize">{browser}</span>
                        <span className="text-sm">{getSupportEmoji(support)}</span>
                      </div>
                    </div>
                  ))}
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
      if (name.toLowerCase().includes('speed') || name.toLowerCase().includes('performance')) {
        return <Zap className="h-3 w-3" />;
      }
      if (name.toLowerCase().includes('security')) {
        return <Shield className="h-3 w-3" />;
      }
      if (name.toLowerCase().includes('accessibility')) {
        return <Activity className="h-3 w-3" />;
      }
      return <CheckCircle className="h-3 w-3" />;
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'good': return 'bg-emerald-500 text-white';
        case 'warning': return 'bg-amber-500 text-white';
        case 'critical': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    };

    return (
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <div>
              <div className={`w-8 h-8 mx-auto mb-2 rounded ${getStatusColor(metric.status)} flex items-center justify-center`}>
                {getMetricIcon(metric.name)}
              </div>
              <h4 className="font-medium text-gray-900 text-xs mb-1">{metric.name}</h4>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {metric.value}{metric.unit}
              </div>
              {metric.benchmark && (
                <div className="bg-gray-50 rounded p-1">
                  <p className="text-xs text-gray-600">
                    Target: {metric.benchmark}{metric.unit}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default StructuredCommentRenderer;
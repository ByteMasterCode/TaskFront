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
  Key
} from 'lucide-react';
import {
  StructuredComment,
  ApiEndpoint,
  DatabaseChange,
  DatabaseField,
  DesignElement,
  QualityMetric,
  BrowserSupport
} from '../../utils/structuredComment';

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
        case 'GET': return 'from-blue-500 to-blue-600 text-white';
        case 'POST': return 'from-green-500 to-green-600 text-white';
        case 'PUT': return 'from-orange-500 to-orange-600 text-white';
        case 'DELETE': return 'from-red-500 to-red-600 text-white';
        case 'PATCH': return 'from-purple-500 to-purple-600 text-white';
        default: return 'from-gray-500 to-gray-600 text-white';
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
        case 'completed': return 'bg-green-100 text-green-800 border-green-300';
        case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'implemented': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'failed': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div className="space-y-3">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getMethodColor(endpoint.method)} shadow-sm flex items-center space-x-1`}>
                    {getMethodIcon(endpoint.method)}
                    <span>{endpoint.method}</span>
                  </span>
                  <code className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-mono text-sm border">
                    {endpoint.path}
                  </code>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(endpoint.status)}`}>
                  {endpoint.status}
                </span>
              </div>
              
              {endpoint.description && (
                <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {endpoint.responseTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{endpoint.responseTime}ms</span>
                  </div>
                )}
                {endpoint.statusCode && (
                  <div className="flex items-center space-x-1">
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
        case 'CREATE': return 'from-green-500 to-green-600 text-white';
        case 'UPDATE': return 'from-blue-500 to-blue-600 text-white';
        case 'DELETE': return 'from-red-500 to-red-600 text-white';
        case 'INDEX': return 'from-purple-500 to-purple-600 text-white';
        case 'MIGRATION': return 'from-orange-500 to-orange-600 text-white';
        default: return 'from-gray-500 to-gray-600 text-white';
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
      <div className="space-y-3">
        {changes.map((change) => (
          <div key={change.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getTypeColor(change.type)} shadow-sm flex items-center space-x-1`}>
                    {getTypeIcon(change.type)}
                    <span>{change.type}</span>
                  </span>
                  <div className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-mono text-sm border flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>{change.table}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  change.status === 'applied' ? 'bg-green-100 text-green-800 border border-green-300' :
                  change.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                  'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {change.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{change.description}</p>
              
              {change.fields && change.fields.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>Fields ({change.fields.length})</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {change.fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                        <div className="flex items-center space-x-2">
                          {getFieldTypeIcon(field.type)}
                          <span className="font-mono text-sm text-gray-800">{field.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {field.primary && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                              PK
                            </span>
                          )}
                          {field.foreign && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                              FK
                            </span>
                          )}
                          {!field.nullable && (
                            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium">
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
        case 'chrome': return <Chrome className="h-4 w-4" />;
        case 'firefox': return <Globe className="h-4 w-4" />;
        case 'safari': return <Monitor className="h-4 w-4" />;
        case 'edge': return <Globe className="h-4 w-4" />;
        case 'mobile': return <Smartphone className="h-4 w-4" />;
        default: return <Globe className="h-4 w-4" />;
      }
    };

    const getSupportColor = (support: string) => {
      switch (support) {
        case 'supported': return 'text-green-600 bg-green-100';
        case 'partial': return 'text-yellow-600 bg-yellow-100';
        case 'unsupported': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
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
      <div className="space-y-3">
        {elements.map((element) => (
          <div key={element.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Palette className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{element.name}</h4>
                    <p className="text-xs text-gray-500">{element.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {element.responsive && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      📱 Responsive
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    element.status === 'implemented' ? 'bg-green-100 text-green-800' :
                    element.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    element.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {element.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Browser Support</h5>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(element.browserSupport).map(([browser, support]) => (
                    <div key={browser} className={`rounded-lg p-2 text-center ${getSupportColor(support)}`}>
                      <div className="flex flex-col items-center space-y-1">
                        {getBrowserIcon(browser)}
                        <span className="text-xs font-medium capitalize">{browser}</span>
                        <span className="text-lg">{getSupportEmoji(support)}</span>
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
        return <Zap className="h-4 w-4" />;
      }
      if (name.toLowerCase().includes('security')) {
        return <Shield className="h-4 w-4" />;
      }
      if (name.toLowerCase().includes('accessibility')) {
        return <Activity className="h-4 w-4" />;
      }
      return <CheckCircle className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'good': return 'from-green-500 to-green-600 text-white';
        case 'warning': return 'from-yellow-500 to-yellow-600 text-white';
        case 'critical': return 'from-red-500 to-red-600 text-white';
        default: return 'from-gray-500 to-gray-600 text-white';
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${getStatusColor(metric.status)} flex items-center justify-center shadow-sm`}>
              {getMetricIcon(metric.name)}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{metric.name}</h4>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {metric.value}{metric.unit}
            </div>
            {metric.benchmark && (
              <p className="text-xs text-gray-500">
                Target: {metric.benchmark}{metric.unit}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'api': return <Code className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'design': return <Palette className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      case 'deployment': return <Server className="h-4 w-4" />;
      case 'status': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'api': return 'from-blue-50 to-indigo-100 border-blue-300';
      case 'database': return 'from-purple-50 to-violet-100 border-purple-300';
      case 'design': return 'from-pink-50 to-rose-100 border-pink-300';
      case 'quality': return 'from-green-50 to-emerald-100 border-green-300';
      case 'deployment': return 'from-orange-50 to-amber-100 border-orange-300';
      case 'status': return 'from-gray-50 to-slate-100 border-gray-300';
      default: return 'from-gray-50 to-slate-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-xl p-4 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Structured Report</h3>
              <p className="text-sm text-gray-600">
                by {comment.author} • {new Date(comment.timestamp).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
          <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            v{comment.version}
          </span>
        </div>
      </div>

      {/* Sections */}
      {comment.sections.map((section, index) => (
        <div key={index} className={`bg-gradient-to-br ${getSectionColor(section.type)} rounded-xl p-4 border shadow-sm`}>
          <div className="flex items-center space-x-2 mb-4">
            {getSectionIcon(section.type)}
            <h4 className="font-bold text-gray-900">{section.title}</h4>
          </div>
          
          <div>
            {section.type === 'api' && section.data.endpoints && renderApiSection(section.data.endpoints)}
            {section.type === 'database' && section.data.changes && renderDatabaseSection(section.data.changes)}
            {section.type === 'design' && section.data.elements && renderDesignSection(section.data.elements)}
            {section.type === 'quality' && section.data.metrics && renderQualitySection(section.data.metrics)}
            {section.type === 'notes' && section.data.text && (
              <div className="bg-white/70 rounded-lg p-3 border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.data.text}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StructuredCommentRenderer;
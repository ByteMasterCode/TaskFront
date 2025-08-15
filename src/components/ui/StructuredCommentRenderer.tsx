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
  Target
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
        case 'GET': return 'from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25';
        case 'POST': return 'from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25';
        case 'PUT': return 'from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25';
        case 'DELETE': return 'from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/25';
        case 'PATCH': return 'from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25';
        default: return 'from-slate-500 via-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/25';
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
        case 'completed': return 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm';
        case 'testing': return 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm';
        case 'implemented': return 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm';
        case 'failed': return 'bg-gradient-to-r from-red-50 to-rose-100 text-red-800 border border-red-200 shadow-sm';
        default: return 'bg-gradient-to-r from-slate-50 to-gray-100 text-slate-800 border border-slate-200 shadow-sm';
      }
    };

    return (
      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-transparent pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${getMethodColor(endpoint.method)} flex items-center space-x-2 transform group-hover:scale-105 transition-transform duration-200`}>
                    {getMethodIcon(endpoint.method)}
                    <span>{endpoint.method}</span>
                  </span>
                  <code className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 px-4 py-2 rounded-xl font-mono text-sm border border-slate-300 shadow-inner">
                    {endpoint.path}
                  </code>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(endpoint.status)} flex items-center space-x-1`}>
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <span className="capitalize">{endpoint.status}</span>
                </span>
              </div>
              
              {endpoint.description && (
                <p className="text-sm text-slate-600 mb-4 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-200">{endpoint.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-xs">
                {endpoint.responseTime && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="font-semibold text-blue-700">{endpoint.responseTime}ms</span>
                  </div>
                )}
                {endpoint.statusCode && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">HTTP {endpoint.statusCode}</span>
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
        case 'CREATE': return 'from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25';
        case 'UPDATE': return 'from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25';
        case 'DELETE': return 'from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/25';
        case 'INDEX': return 'from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25';
        case 'MIGRATION': return 'from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25';
        default: return 'from-slate-500 via-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/25';
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
      <div className="space-y-4">
        {changes.map((change) => (
          <div key={change.id} className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-transparent pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${getTypeColor(change.type)} flex items-center space-x-2 transform group-hover:scale-105 transition-transform duration-200`}>
                    {getTypeIcon(change.type)}
                    <span>{change.type}</span>
                  </span>
                  <div className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 px-4 py-2 rounded-xl font-mono text-sm border border-slate-300 shadow-inner flex items-center space-x-2">
                    <Database className="h-4 w-4 text-slate-600" />
                    <span>{change.table}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                  change.status === 'applied' ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm' :
                  change.status === 'pending' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm' :
                  'bg-gradient-to-r from-red-50 to-rose-100 text-red-800 border border-red-200 shadow-sm'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <span className="capitalize">{change.status}</span>
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mb-4 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-200">{change.description}</p>
              
              {change.fields && change.fields.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
                  <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
                    <Database className="h-4 w-4 text-slate-600" />
                    <span>Fields</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{change.fields.length}</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    {change.fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          {getFieldTypeIcon(field.type)}
                          <span className="font-mono text-sm font-semibold text-slate-800">{field.name}</span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {field.primary && (
                            <span className="text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-2 py-1 rounded-lg font-bold border border-yellow-200 shadow-sm">
                              PK
                            </span>
                          )}
                          {field.foreign && (
                            <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-lg font-bold border border-blue-200 shadow-sm">
                              FK
                            </span>
                          )}
                          {!field.nullable && (
                            <span className="text-xs bg-gradient-to-r from-red-100 to-rose-100 text-red-800 px-2 py-1 rounded-lg font-bold border border-red-200 shadow-sm">
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
        case 'supported': return 'text-emerald-700 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200';
        case 'partial': return 'text-amber-700 bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200';
        case 'unsupported': return 'text-red-700 bg-gradient-to-br from-red-50 to-rose-100 border-red-200';
        default: return 'text-slate-700 bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200';
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
      <div className="space-y-4">
        {elements.map((element) => (
          <div key={element.id} className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/20 to-transparent pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{element.name}</h4>
                    <p className="text-sm text-slate-600 font-medium capitalize">{element.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {element.responsive && (
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1.5 rounded-full font-bold border border-blue-200 shadow-sm flex items-center space-x-1">
                      <Smartphone className="h-3 w-3" />
                      📱 Responsive
                    </span>
                  )}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                    element.status === 'implemented' ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm' :
                    element.status === 'approved' ? 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm' :
                    element.status === 'review' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm' :
                    'bg-gradient-to-r from-slate-50 to-gray-100 text-slate-800 border border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                    <span className="capitalize">{element.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
                <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-slate-600" />
                  <span>Browser Support</span>
                </h5>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(element.browserSupport).map(([browser, support]) => (
                    <div key={browser} className={`rounded-xl p-3 text-center border shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 ${getSupportColor(support)}`}>
                      <div className="flex flex-col items-center space-y-2">
                        {getBrowserIcon(browser)}
                        <span className="text-xs font-bold capitalize">{browser}</span>
                        <span className="text-xl">{getSupportEmoji(support)}</span>
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
        case 'good': return 'from-emerald-500 via-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-500/25';
        case 'warning': return 'from-amber-500 via-amber-600 to-yellow-700 text-white shadow-lg shadow-amber-500/25';
        case 'critical': return 'from-red-500 via-red-600 to-rose-700 text-white shadow-lg shadow-red-500/25';
        default: return 'from-slate-500 via-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/25';
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-transparent pointer-events-none"></div>
            <div className="relative">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${getStatusColor(metric.status)} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200`}>
                {getMetricIcon(metric.name)}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 leading-tight">{metric.name}</h4>
              <div className="text-3xl font-black text-slate-800 mb-2 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {metric.value}{metric.unit}
              </div>
              {metric.benchmark && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 flex items-center justify-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>Target: {metric.benchmark}{metric.unit}</span>
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
      case 'api': return 'from-blue-50 via-indigo-50 to-blue-100 border-blue-200 shadow-blue-100/50';
      case 'database': return 'from-purple-50 via-violet-50 to-purple-100 border-purple-200 shadow-purple-100/50';
      case 'design': return 'from-pink-50 via-rose-50 to-pink-100 border-pink-200 shadow-pink-100/50';
      case 'quality': return 'from-emerald-50 via-green-50 to-emerald-100 border-emerald-200 shadow-emerald-100/50';
      case 'deployment': return 'from-amber-50 via-orange-50 to-amber-100 border-amber-200 shadow-amber-100/50';
      case 'status': return 'from-slate-50 via-gray-50 to-slate-100 border-slate-200 shadow-slate-100/50';
      default: return 'from-slate-50 via-gray-50 to-slate-100 border-slate-200 shadow-slate-100/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl shadow-indigo-500/25 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-white text-xl flex items-center space-x-2">
                <span>Structured Report</span>
                <Star className="h-5 w-5 text-yellow-300" />
              </h3>
              <p className="text-sm text-white/80 font-medium">
                by {comment.author} • {new Date(comment.timestamp).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
          <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-black shadow-lg border border-white/30 flex items-center space-x-1">
            <Award className="h-4 w-4" />
            <span>v{comment.version}</span>
          </span>
        </div>
      </div>

      {/* Sections */}
      {comment.sections.map((section, index) => (
        <div key={index} className={`bg-gradient-to-br ${getSectionColor(section.type)} rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none"></div>
          <div className="flex items-center space-x-3 mb-5 relative z-10">
            <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/50">
              {getSectionIcon(section.type)}
            </div>
            <h4 className="font-black text-slate-900 text-lg">{section.title}</h4>
          </div>
          
          <div className="relative z-10">
            {section.type === 'api' && section.data.endpoints && renderApiSection(section.data.endpoints)}
            {section.type === 'database' && section.data.changes && renderDatabaseSection(section.data.changes)}
            {section.type === 'design' && section.data.elements && renderDesignSection(section.data.elements)}
            {section.type === 'quality' && section.data.metrics && renderQualitySection(section.data.metrics)}
            {section.type === 'notes' && section.data.text && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-inner">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{section.data.text}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StructuredCommentRenderer;
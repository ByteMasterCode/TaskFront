// Система структурированных комментариев
export interface StructuredComment {
  version: string;
  timestamp: string;
  author: string;
  sections: CommentSection[];
}

export interface CommentSection {
  type: 'status' | 'api' | 'database' | 'design' | 'quality' | 'deployment' | 'notes';
  title: string;
  data: any;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'implemented' | 'testing' | 'completed' | 'failed';
  responseTime?: number;
  statusCode?: number;
}

export interface DatabaseChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'INDEX' | 'MIGRATION';
  table: string;
  description: string;
  status: 'pending' | 'applied' | 'failed';
  fields?: DatabaseField[];
}

export interface DatabaseField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'uuid';
  nullable: boolean;
  primary?: boolean;
  foreign?: string;
}

export interface DesignElement {
  id: string;
  type: 'component' | 'page' | 'style' | 'animation';
  name: string;
  status: 'draft' | 'review' | 'approved' | 'implemented';
  browserSupport: BrowserSupport;
  responsive: boolean;
  figmaUrl?: string;
  links?: Link[];
  figmaUrl?: string;
  links?: Link[];
}

export interface BrowserSupport {
  chrome: 'supported' | 'partial' | 'unsupported';
  firefox: 'supported' | 'partial' | 'unsupported';
  safari: 'supported' | 'partial' | 'unsupported';
  edge: 'supported' | 'partial' | 'unsupported';
  mobile: 'supported' | 'partial' | 'unsupported';
}

export interface QualityMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  benchmark?: string | number;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type: 'external' | 'internal' | 'figma' | 'github' | 'docs';
  description?: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type: 'external' | 'internal' | 'figma' | 'github' | 'docs';
  description?: string;
}

// Сериализация в строку
export function serializeComment(comment: StructuredComment): string {
  return `<!--STRUCTURED:${JSON.stringify(comment)}-->`;
}

// Десериализация из строки
export function deserializeComment(text: string): StructuredComment | null {
  const match = text.match(/<!--STRUCTURED:(.+?)-->/s);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Проверка, является ли комментарий структурированным
export function isStructuredComment(text: string): boolean {
  return text.includes('<!--STRUCTURED:');
}

// Создание нового структурированного комментария
export function createStructuredComment(author: string): StructuredComment {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    author,
    sections: []
  };
}

// Добавление секции
export function addSection(comment: StructuredComment, section: CommentSection): StructuredComment {
  return {
    ...comment,
    sections: [...comment.sections, section]
  };
}

// Получение секции по типу
export function getSection(comment: StructuredComment, type: string): CommentSection | undefined {
  return comment.sections.find(s => s.type === type);
}

// Обновление секции
export function updateSection(comment: StructuredComment, type: string, data: any): StructuredComment {
  return {
    ...comment,
    sections: comment.sections.map(s => 
      s.type === type ? { ...s, data } : s
    )
  };
}

// Конвертация старых текстовых комментариев в структурированные
export function convertLegacyComment(text: string, author: string): StructuredComment {
  const comment = createStructuredComment(author);
  
  // Парсинг API endpoints
  const apiMatches = text.match(/(?:GET|POST|PUT|DELETE|PATCH)\s+[^\s]+/g);
  if (apiMatches) {
    const endpoints: ApiEndpoint[] = apiMatches.map((match, index) => {
      const [method, path] = match.split(/\s+/);
      return {
        id: `api-${index}`,
        method: method as any,
        path,
        description: 'Converted from legacy comment',
        status: 'completed'
      };
    });
    
    comment.sections.push({
      type: 'api',
      title: 'API Endpoints',
      data: { endpoints }
    });
  }
  
  // Парсинг изменений БД
  const dbMatches = text.match(/(CREATE|UPDATE|DELETE|INDEX|MIGRATION)\s+[^\n]+/g);
  if (dbMatches) {
    const changes: DatabaseChange[] = dbMatches.map((match, index) => {
      const [type, ...rest] = match.split(/\s+/);
      return {
        id: `db-${index}`,
        type: type as any,
        table: rest[0] || 'unknown',
        description: rest.slice(1).join(' ') || 'Converted from legacy comment',
        status: 'applied'
      };
    });
    
    comment.sections.push({
      type: 'database',
      title: 'Database Changes',
      data: { changes }
    });
  }
  
  // Остальной текст как заметки
  let notes = text;
  if (apiMatches) {
    apiMatches.forEach(match => {
      notes = notes.replace(match, '');
    });
  }
  if (dbMatches) {
    dbMatches.forEach(match => {
      notes = notes.replace(match, '');
    });
  }
  
  notes = notes.trim();
  if (notes) {
    comment.sections.push({
      type: 'notes',
      title: 'Additional Notes',
      data: { text: notes }
    });
  }
  
  return comment;
}
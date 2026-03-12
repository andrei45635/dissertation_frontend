export type SourceType = 'ZIP_UPLOAD' | 'GIT_CLONE';

export interface MicroserviceResponse {
  id: number;
  name: string;
  relativePath: string;
  linesOfCode: number;
  numberOfEndpoints: number;
}

export interface Project {
  id: number;
  name: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  createdAt: string;
  microservices: MicroserviceResponse[];
}

export interface AnalysisJob {
  id: number;
  projectId: number;
  status: JobStatus;
  currentPhase: string | null;
  currentService: string | null;
  servicesCompleted: number | null;
  totalServices: number | null;
  progressPercentage: number | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
}

export type JobStatus =
  | 'PENDING'
  | 'CLONING'
  | 'DETECTING_SERVICES'
  | 'ANALYZING_SERVICES'
  | 'BUILDING_GRAPH'
  | 'DETECTING_PATTERNS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface AnalysisResult {
  id: number;
  jobId: number;
  healthScore: number;
  servicesAnalyzed: number;
  totalAntiPatterns: number;
  totalCodeSmells: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  totalLinesOfCode: number;
  averageServiceSize: number;
  cycleCount: number;
  antiPatterns: DetectedAntiPattern[];
  dependencyGraph: DependencyGraph;
}

export interface CodeSnippet {
  file: string;
  startLine: number;
  endLine: number;
  highlightLine: number;
  snippet: string;
}

export interface DetectedAntiPattern {
  id: number;
  patternType: AntiPatternType;
  severity: Severity;
  description: string;
  affectedServices: string[];
  remediation: string;
  codeSnippets: CodeSnippet[];
}

export type AntiPatternType =
  | 'CYCLIC_DEPENDENCY'
  | 'SHARED_DATABASE'
  | 'NANO_SERVICE'
  | 'GOD_SERVICE'
  | 'CHATTY_SERVICE'
  | 'HARDCODED_ENDPOINTS'
  | 'DISTRIBUTED_MONOLITH'
  | 'API_VERSIONING_ABSENCE'
  | 'WRONG_CUTS'
  | 'ESB_MISUSE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  name: string;
  linesOfCode: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface UploadResponse {
  projectId: number;
  jobId: number;
}

export interface GitCloneRequest {
  repoUrl: string;
  name: string;
  branch?: string;
}


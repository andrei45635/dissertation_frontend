export interface Project {
  id: number;
  name: string;
  sourceType: 'GITHUB' | 'GITLAB' | 'UPLOAD';
  sourceUrl?: string;
  createdAt: string;
}

export interface AnalysisJob {
  id: number;
  projectId: number;
  status: JobStatus;
  currentPhase?: string;
  currentService?: string;
  servicesCompleted: number;
  totalServices: number;
  progressPercentage: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
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

export interface DetectedAntiPattern {
  id: number;
  patternType: AntiPatternType;
  severity: Severity;
  description: string;
  affectedServices: string[];
  remediation?: string;
  details?: Record<string, unknown>;
}

export type AntiPatternType =
  | 'CYCLIC_DEPENDENCY'
  | 'SHARED_DATABASE'
  | 'NANO_SERVICE'
  | 'GOD_SERVICE'
  | 'CHATTY_SERVICE'
  | 'HARDCODED_ENDPOINTS'
  | 'DISTRIBUTED_MONOLITH';

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

export type SourceType = 'UPLOAD' | 'GITHUB' | 'GITLAB' | 'ZIP_UPLOAD' | 'GIT_CLONE';

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
  branch: string | null;
  createdAt: string;
  microservices: MicroserviceResponse[];
  analysisCount: number;
  latestJobId: number | null;
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
  analysisNumber: number;
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
  healthScoreBreakdown: HealthScoreBreakdown | null;
  diff: AnalysisDiffResponse | null;
}

export interface AnalysisDiffResponse {
  currentJobId: number;
  previousJobId: number;
  currentAnalysisDate: string;
  previousAnalysisDate: string;
  analysisNumber: number;

  currentHealthScore: number;
  previousHealthScore: number;
  healthScoreDelta: number;
  currentGrade: string;
  previousGrade: string;

  totalAntiPatterns: MetricDelta;
  totalCodeSmells: MetricDelta;
  criticalIssues: MetricDelta;
  highIssues: MetricDelta;
  mediumIssues: MetricDelta;
  lowIssues: MetricDelta;
  totalLinesOfCode: MetricDelta;
  servicesAnalyzed: MetricDelta;
  cycleCount: MetricDelta;
  totalDependencies: MetricDelta;
  couplingCoefficient: DoubleDelta;

  resolvedAntiPatterns: AntiPatternChange[];
  newAntiPatterns: AntiPatternChange[];
  unchangedAntiPatterns: AntiPatternChange[];

  categoryDeltas: CategoryDelta[];

  summary: string;
}

export interface MetricDelta {
  previous: number;
  current: number;
  delta: number;
}

export interface DoubleDelta {
  previous: number;
  current: number;
  delta: number;
}

export interface AntiPatternChange {
  patternType: string;
  severity: string;
  description: string;
  affectedServices: string[];
}

export interface CategoryDelta {
  categoryName: string;
  previousScore: number;
  currentScore: number;
  maxScore: number;
  delta: number;
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

export interface ReanalyzeRequest {
  repoUrl?: string;
  branch?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface HealthScoreBreakdown {
  overallScore: number;
  grade: string;
  categories: ScoreCategory[];
}

export interface ScoreCategory {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  deductions: ScoreDeduction[];
}

export interface ScoreDeduction {
  reason: string;
  count: number;
  pointsLost: number;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

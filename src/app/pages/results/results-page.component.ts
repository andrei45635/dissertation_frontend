import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { HealthScoreComponent } from '../../components/health-score/health-score.component';
import { HealthScoreBreakdownComponent } from '../../components/health-score-breakdown/health-score-breakdown.component';
import { AntiPatternListComponent } from '../../components/anti-pattern-list/anti-pattern-list.component';
import { DependencyGraphComponent } from '../../components/dependency-graph/dependency-graph.component';
import { DiffBannerComponent } from '../../components/diff-banner/diff-banner.component';
import { ProgressTrackerComponent } from '../../components/progress-tracker/progress-tracker.component';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { ApiService } from '../../services/api.service';
import { AnalysisResult, AnalysisJob, Project } from '../../models';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HealthScoreComponent,
    HealthScoreBreakdownComponent,
    AntiPatternListComponent,
    DependencyGraphComponent,
    DiffBannerComponent,
    ProgressTrackerComponent,
    FileUploadComponent
  ],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.css'
})
export class ResultsPageComponent implements OnInit, OnDestroy {
  result: AnalysisResult | null = null;
  isLoading = true;
  projectId: number | null = null;
  project: Project | null = null;
  isReanalyzing = false;
  reanalyzeError: string | null = null;
  reanalyzeJob: AnalysisJob | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Dropdown menu
  showReanalyzeMenu = false;

  showReuploadModal = false;
  reuploadFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  showGitModal = false;
  gitRepoUrl = '';
  gitBranch = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadResults(jobId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.reanalyze-dropdown')) {
      this.showReanalyzeMenu = false;
    }
  }

  private loadResults(jobId: number): void {
    this.apiService.getJobResults(jobId).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
        this.apiService.getJobStatus(jobId).subscribe({
          next: (job) => {
            this.projectId = job.projectId;
            this.apiService.getProject(job.projectId).subscribe({
              next: (project) => {
                this.project = project;
                // Pre-fill git fields from project
                if (project.sourceUrl) {
                  this.gitRepoUrl = project.sourceUrl;
                }
                if (project.branch) {
                  this.gitBranch = project.branch;
                }
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Failed to load results:', error);
        this.isLoading = false;
      }
    });
  }

  toggleMenu(): void {
    this.showReanalyzeMenu = !this.showReanalyzeMenu;
  }

  reanalyze(): void {
    if (!this.projectId || this.isReanalyzing) return;
    this.showReanalyzeMenu = false;
    this.isReanalyzing = true;
    this.reanalyzeError = null;
    this.reanalyzeJob = null;

    this.apiService.reanalyzeProject(this.projectId).subscribe({
      next: (response) => {
        this.startPolling(response.jobId);
      },
      error: (error) => {
        this.isReanalyzing = false;
        this.reanalyzeError = error.error?.message || 'Failed to start re-analysis.';
      }
    });
  }

  openReuploadModal(): void {
    this.showReanalyzeMenu = false;
    this.showReuploadModal = true;
    this.showGitModal = false;
    this.reuploadFile = null;
    this.uploadProgress = 0;
    this.reanalyzeError = null;
  }

  onReuploadFileSelected(file: File | null): void {
    this.reuploadFile = file;
  }

  submitReupload(): void {
    if (!this.projectId || !this.reuploadFile || this.isUploading) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.reanalyzeError = null;

    this.apiService.reuploadProject(this.projectId, this.reuploadFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response && event.body) {
          this.isUploading = false;
          this.showReuploadModal = false;
          this.isReanalyzing = true;
          this.startPolling(event.body.jobId);
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.reanalyzeError = error.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  openGitModal(): void {
    this.showReanalyzeMenu = false;
    this.showGitModal = true;
    this.showReuploadModal = false;
    this.reanalyzeError = null;
  }

  get isValidGitUrl(): boolean {
    if (!this.gitRepoUrl) return false;
    return /^https:\/\/(github\.com|gitlab\.com)\/[\w.\-]+\/[\w.\-]+(\.git)?$/.test(this.gitRepoUrl.trim());
  }

  submitGitClone(): void {
    if (!this.projectId || !this.isValidGitUrl || this.isReanalyzing) return;

    this.showGitModal = false;
    this.isReanalyzing = true;
    this.reanalyzeError = null;
    this.reanalyzeJob = null;

    const request = {
      repoUrl: this.gitRepoUrl.trim(),
      ...(this.gitBranch.trim() ? { branch: this.gitBranch.trim() } : {})
    };

    this.apiService.reanalyzeProject(this.projectId, request).subscribe({
      next: (response) => {
        this.startPolling(response.jobId);
      },
      error: (error) => {
        this.isReanalyzing = false;
        this.reanalyzeError = error.error?.message || 'Failed to clone repository.';
      }
    });
  }

  closeModals(): void {
    this.showReuploadModal = false;
    this.showGitModal = false;
  }

  private startPolling(jobId: number): void {
    this.pollJobStatus(jobId);
    this.pollingInterval = setInterval(() => this.pollJobStatus(jobId), 2000);
  }

  private pollJobStatus(jobId: number): void {
    this.apiService.getJobStatus(jobId).subscribe({
      next: (job) => {
        this.reanalyzeJob = job;
        if (job.status === 'COMPLETED') {
          this.stopPolling();
          this.router.navigate(['/results', jobId]);
          this.isReanalyzing = false;
          this.reanalyzeJob = null;
          this.isLoading = true;
          this.loadResults(jobId);
        } else if (job.status === 'FAILED' || job.status === 'CANCELLED') {
          this.stopPolling();
          this.isReanalyzing = false;
          this.reanalyzeError = job.errorMessage || 'Re-analysis failed.';
        }
      },
      error: () => {
        this.stopPolling();
        this.isReanalyzing = false;
        this.reanalyzeError = 'Lost connection while polling re-analysis status.';
      }
    });
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  get isGitProject(): boolean {
    return this.project?.sourceType === 'GITHUB' || this.project?.sourceType === 'GITLAB' || this.project?.sourceType === 'GIT_CLONE';
  }

  get isUploadProject(): boolean {
    return this.project?.sourceType === 'UPLOAD' || this.project?.sourceType === 'ZIP_UPLOAD';
  }

  get sourceLabel(): string {
    if (this.isGitProject) return 'Git';
    if (this.isUploadProject) return 'ZIP';
    return 'current source';
  }

  exportResults(): void {
    if (!this.result) return;

    const json = JSON.stringify(this.result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${this.result.jobId}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}

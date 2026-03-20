import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { AnalysisJob, Project, AnalysisResult } from '../../models';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FileUploadComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.css'
})
export class HistoryPageComponent implements OnInit, OnDestroy {
  jobs: AnalysisJob[] = [];
  projects: Project[] = [];
  isLoading = true;
  activeTab: 'projects' | 'jobs' = 'projects';

  expandedProjectId: number | null = null;
  projectHistory: AnalysisResult[] = [];
  isLoadingHistory = false;

  reanalyzingProjectId: number | null = null;
  reanalyzeError: string | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  openDropdownProjectId: number | null = null;

  showReuploadModal = false;
  reuploadProjectId: number | null = null;
  reuploadFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  showGitModal = false;
  gitProjectId: number | null = null;
  gitRepoUrl = '';
  gitBranch = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.reanalyze-dropdown')) {
      this.openDropdownProjectId = null;
    }
  }

  private loadData(): void {
    this.apiService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.isLoading = false;
      }
    });

    this.apiService.getRecentJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Failed to load jobs:', error);
      }
    });
  }

  setTab(tab: 'projects' | 'jobs'): void {
    this.activeTab = tab;
  }

  toggleProjectHistory(project: Project): void {
    if (this.expandedProjectId === project.id) {
      this.expandedProjectId = null;
      this.projectHistory = [];
      return;
    }

    this.expandedProjectId = project.id;
    this.isLoadingHistory = true;
    this.projectHistory = [];

    this.apiService.getProjectHistory(project.id).subscribe({
      next: (history) => {
        this.projectHistory = history;
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Failed to load project history:', error);
        this.isLoadingHistory = false;
      }
    });
  }

  toggleDropdown(projectId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownProjectId = this.openDropdownProjectId === projectId ? null : projectId;
  }

  isGitProject(project: Project): boolean {
    return project.sourceType === 'GITHUB' || project.sourceType === 'GITLAB' || project.sourceType === 'GIT_CLONE';
  }

  sourceLabel(project: Project): string {
    if (this.isGitProject(project)) return 'Git';
    return 'ZIP';
  }

  reanalyze(projectId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownProjectId = null;
    if (this.reanalyzingProjectId) return;

    this.reanalyzingProjectId = projectId;
    this.reanalyzeError = null;

    this.apiService.reanalyzeProject(projectId).subscribe({
      next: (response) => {
        this.startPolling(response.jobId);
      },
      error: (error) => {
        this.reanalyzingProjectId = null;
        this.reanalyzeError = error.error?.message || 'Failed to start re-analysis.';
      }
    });
  }

  openReuploadModal(projectId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownProjectId = null;
    this.showReuploadModal = true;
    this.showGitModal = false;
    this.reuploadProjectId = projectId;
    this.reuploadFile = null;
    this.uploadProgress = 0;
    this.reanalyzeError = null;
  }

  onReuploadFileSelected(file: File | null): void {
    this.reuploadFile = file;
  }

  submitReupload(): void {
    if (!this.reuploadProjectId || !this.reuploadFile || this.isUploading) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.reanalyzeError = null;

    this.apiService.reuploadProject(this.reuploadProjectId, this.reuploadFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response && event.body) {
          this.isUploading = false;
          this.showReuploadModal = false;
          this.reanalyzingProjectId = this.reuploadProjectId;
          this.startPolling(event.body.jobId);
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.reanalyzeError = error.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  openGitModal(project: Project, event: Event): void {
    event.stopPropagation();
    this.openDropdownProjectId = null;
    this.showGitModal = true;
    this.showReuploadModal = false;
    this.gitProjectId = project.id;
    this.gitRepoUrl = project.sourceUrl || '';
    this.gitBranch = project.branch || '';
    this.reanalyzeError = null;
  }

  get isValidGitUrl(): boolean {
    if (!this.gitRepoUrl) return false;
    return /^https:\/\/(github\.com|gitlab\.com)\/[\w.\-]+\/[\w.\-]+(\.git)?$/.test(this.gitRepoUrl.trim());
  }

  submitGitClone(): void {
    if (!this.gitProjectId || !this.isValidGitUrl || this.reanalyzingProjectId) return;

    this.showGitModal = false;
    this.reanalyzingProjectId = this.gitProjectId;
    this.reanalyzeError = null;

    const request = {
      repoUrl: this.gitRepoUrl.trim(),
      ...(this.gitBranch.trim() ? { branch: this.gitBranch.trim() } : {})
    };

    this.apiService.reanalyzeProject(this.gitProjectId, request).subscribe({
      next: (response) => {
        this.startPolling(response.jobId);
      },
      error: (error) => {
        this.reanalyzingProjectId = null;
        this.reanalyzeError = error.error?.message || 'Failed to clone repository.';
      }
    });
  }

  closeModals(): void {
    this.showReuploadModal = false;
    this.showGitModal = false;
  }

  private startPolling(jobId: number): void {
    this.pollingInterval = setInterval(() => {
      this.apiService.getJobStatus(jobId).subscribe({
        next: (job) => {
          if (job.status === 'COMPLETED') {
            this.stopPolling();
            this.reanalyzingProjectId = null;
            this.router.navigate(['/results', jobId]);
          } else if (job.status === 'FAILED' || job.status === 'CANCELLED') {
            this.stopPolling();
            this.reanalyzingProjectId = null;
            this.reanalyzeError = job.errorMessage || 'Re-analysis failed.';
          }
        },
        error: () => {
          this.stopPolling();
          this.reanalyzingProjectId = null;
        }
      });
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  deleteProject(projectId: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all its analyses?')) return;

    this.apiService.deleteProject(projectId).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== projectId);
        if (this.expandedProjectId === projectId) {
          this.expandedProjectId = null;
          this.projectHistory = [];
        }
      },
      error: (error) => {
        console.error('Failed to delete project:', error);
      }
    });
  }

  getDeltaClass(delta: number): string {
    if (delta > 0) return 'delta-positive';
    if (delta < 0) return 'delta-negative';
    return 'delta-neutral';
  }

  getDeltaText(delta: number): string {
    if (delta === 0) return '±0';
    return delta > 0 ? `+${delta}` : `${delta}`;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Not started';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { ProgressTrackerComponent } from '../../components/progress-tracker/progress-tracker.component';
import { ApiService } from '../../services/api.service';
import { AnalysisJob } from '../../models';

type InputMode = 'upload' | 'clone';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, ProgressTrackerComponent],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.css'
})
export class UploadPageComponent implements OnDestroy {
  activeMode: InputMode = 'upload';

  // Shared
  projectName = '';
  isAnalyzing = false;
  currentJob: AnalysisJob | null = null;

  // ZIP upload
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  // Git clone
  repoUrl = '';
  branch = '';
  isCloning = false;
  cloneError: string | null = null;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  setMode(mode: InputMode): void {
    this.activeMode = mode;
    this.cloneError = null;
  }

  onFileSelected(file: File | null): void {
    this.selectedFile = file;
    if (file && !this.projectName) {
      this.projectName = file.name.replace('.zip', '');
    }
  }

  onRepoUrlChange(): void {
    if (this.repoUrl && !this.projectName) {
      // Extract repo name from URL: https://github.com/owner/repo(.git)
      const match = this.repoUrl.match(/\/([^\/]+?)(\.git)?$/);
      if (match) {
        this.projectName = match[1];
      }
    }
  }

  get isValidRepoUrl(): boolean {
    if (!this.repoUrl) return false;
    return /^https:\/\/(github\.com|gitlab\.com)\/[^\/]+\/[^\/]+(\.git)?$/.test(this.repoUrl.trim());
  }

  get canStartAnalysis(): boolean {
    if (!this.projectName) return false;
    if (this.activeMode === 'upload') {
      return !!this.selectedFile && !this.isUploading;
    } else {
      return this.isValidRepoUrl && !this.isCloning;
    }
  }

  get isSubmitting(): boolean {
    return this.isUploading || this.isCloning;
  }

  startAnalysis(): void {
    if (!this.canStartAnalysis) return;

    if (this.activeMode === 'upload') {
      this.startUploadAnalysis();
    } else {
      this.startCloneAnalysis();
    }
  }

  private startUploadAnalysis(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.apiService.uploadProject(this.selectedFile, this.projectName).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response && event.body) {
          this.isUploading = false;
          this.isAnalyzing = true;
          this.startPolling(event.body.jobId);
        }
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload failed:', error);
      }
    });
  }

  private startCloneAnalysis(): void {
    this.isCloning = true;
    this.cloneError = null;

    const request = {
      repoUrl: this.repoUrl.trim(),
      name: this.projectName,
      ...(this.branch.trim() ? { branch: this.branch.trim() } : {})
    };

    this.apiService.cloneProject(request).subscribe({
      next: (response) => {
        this.isCloning = false;
        this.isAnalyzing = true;
        this.startPolling(response.jobId);
      },
      error: (error) => {
        this.isCloning = false;
        this.cloneError = error.error?.message || error.message || 'Failed to clone repository. Make sure the URL is correct and the repository is public.';
        console.error('Clone failed:', error);
      }
    });
  }

  private startPolling(jobId: number): void {
    this.pollJobStatus(jobId);
    this.pollingInterval = setInterval(() => this.pollJobStatus(jobId), 2000);
  }

  private pollJobStatus(jobId: number): void {
    this.apiService.getJobStatus(jobId).subscribe({
      next: (job) => {
        this.currentJob = job;
        if (job.status === 'COMPLETED') {
          this.stopPolling();
          this.router.navigate(['/results', jobId]);
        } else if (job.status === 'FAILED' || job.status === 'CANCELLED') {
          this.stopPolling();
        }
      },
      error: (error) => {
        console.error('Polling failed:', error);
        this.stopPolling();
      }
    });
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  reset(): void {
    this.selectedFile = null;
    this.projectName = '';
    this.repoUrl = '';
    this.branch = '';
    this.isAnalyzing = false;
    this.isCloning = false;
    this.cloneError = null;
    this.currentJob = null;
    this.uploadProgress = 0;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}

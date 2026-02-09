import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { ProgressTrackerComponent } from '../../components/progress-tracker/progress-tracker.component';
import { ApiService } from '../../services/api.service';
import { AnalysisJob } from '../../models';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, ProgressTrackerComponent],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.css'
})
export class UploadPageComponent implements OnDestroy {
  projectName = '';
  selectedFile: File | null = null;
  isUploading = false;
  isAnalyzing = false;
  uploadProgress = 0;
  currentJob: AnalysisJob | null = null;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onFileSelected(file: File | null): void {
    this.selectedFile = file;
    if (file && !this.projectName) {
      this.projectName = file.name.replace('.zip', '');
    }
  }

  startAnalysis(): void {
    if (!this.selectedFile || !this.projectName) return;

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
    this.isAnalyzing = false;
    this.currentJob = null;
    this.uploadProgress = 0;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}

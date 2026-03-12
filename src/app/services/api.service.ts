import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalysisJob, AnalysisResult, GitCloneRequest, Project, UploadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Projects ──────────────────────────────────────────

  uploadProject(file: File, projectName: string): Observable<HttpEvent<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', projectName);

    return this.http.post<UploadResponse>(`${this.baseUrl}/projects/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  cloneProject(request: GitCloneRequest): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(`${this.baseUrl}/projects/clone`, request);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
  }

  // ── Jobs ──────────────────────────────────────────────

  getJobStatus(jobId: number): Observable<AnalysisJob> {
    return this.http.get<AnalysisJob>(`${this.baseUrl}/jobs/${jobId}`);
  }

  getJobResults(jobId: number): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/jobs/${jobId}/results`);
  }

  getRecentJobs(): Observable<AnalysisJob[]> {
    return this.http.get<AnalysisJob[]>(`${this.baseUrl}/jobs/recent`);
  }

  cancelJob(jobId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/jobs/${jobId}/cancel`, null);
  }
}

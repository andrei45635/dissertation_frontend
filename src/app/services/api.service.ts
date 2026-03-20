import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalysisJob, AnalysisResult, AnalysisDiffResponse, GitCloneRequest, Project, ReanalyzeRequest, UploadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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

  reanalyzeProject(projectId: number, request?: ReanalyzeRequest): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(`${this.baseUrl}/projects/${projectId}/reanalyze`, request ?? {});
  }

  reuploadProject(projectId: number, file: File): Observable<HttpEvent<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.baseUrl}/projects/${projectId}/reupload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getProjectHistory(projectId: number): Observable<AnalysisResult[]> {
    return this.http.get<AnalysisResult[]>(`${this.baseUrl}/projects/${projectId}/history`);
  }

  getJobStatus(jobId: number): Observable<AnalysisJob> {
    return this.http.get<AnalysisJob>(`${this.baseUrl}/jobs/${jobId}`);
  }

  getJobResults(jobId: number): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/jobs/${jobId}/results`);
  }

  getJobDiff(jobId: number): Observable<AnalysisDiffResponse> {
    return this.http.get<AnalysisDiffResponse>(`${this.baseUrl}/jobs/${jobId}/diff`);
  }

  getRecentJobs(): Observable<AnalysisJob[]> {
    return this.http.get<AnalysisJob[]>(`${this.baseUrl}/jobs/recent`);
  }

  cancelJob(jobId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/jobs/${jobId}/cancel`, null);
  }
}

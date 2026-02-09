import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalysisJob, AnalysisResult, UploadResponse } from '../models';

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

  getJobStatus(jobId: number): Observable<AnalysisJob> {
    return this.http.get<AnalysisJob>(`${this.baseUrl}/jobs/${jobId}`);
  }

  getJobResults(jobId: number): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/jobs/${jobId}/results`);
  }

  getRecentJobs(): Observable<AnalysisJob[]> {
    return this.http.get<AnalysisJob[]>(`${this.baseUrl}/jobs/recent`);
  }
}

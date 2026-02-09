import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HealthScoreComponent } from '../../components/health-score/health-score.component';
import { AntiPatternListComponent } from '../../components/anti-pattern-list/anti-pattern-list.component';
import { DependencyGraphComponent } from '../../components/dependency-graph/dependency-graph.component';
import { ApiService } from '../../services/api.service';
import { AnalysisResult } from '../../models';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HealthScoreComponent,
    AntiPatternListComponent,
    DependencyGraphComponent
  ],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.css'
})
export class ResultsPageComponent implements OnInit {
  result: AnalysisResult | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadResults(jobId);
  }

  private loadResults(jobId: number): void {
    this.apiService.getJobResults(jobId).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load results:', error);
        this.isLoading = false;
      }
    });
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
}

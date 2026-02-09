import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisJob } from '../../models';

@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-tracker.component.html',
  styleUrl: './progress-tracker.component.css'
})
export class ProgressTrackerComponent {
  @Input() job!: AnalysisJob;

  steps = [
    { key: 'CLONING', label: 'Cloning' },
    { key: 'DETECTING_SERVICES', label: 'Detecting' },
    { key: 'ANALYZING_SERVICES', label: 'Analyzing' },
    { key: 'BUILDING_GRAPH', label: 'Building Graph' },
    { key: 'DETECTING_PATTERNS', label: 'Detecting Patterns' },
    { key: 'COMPLETED', label: 'Complete' }
  ];

  private stepOrder = ['PENDING', 'CLONING', 'DETECTING_SERVICES', 'ANALYZING_SERVICES', 'BUILDING_GRAPH', 'DETECTING_PATTERNS', 'COMPLETED'];

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  isStepActive(stepKey: string): boolean {
    return this.job.status === stepKey;
  }

  isStepCompleted(stepKey: string): boolean {
    const currentIndex = this.stepOrder.indexOf(this.job.status);
    const stepIndex = this.stepOrder.indexOf(stepKey);
    return stepIndex < currentIndex;
  }
}

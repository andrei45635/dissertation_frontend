import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-score.component.html',
  styleUrl: './health-score.component.css'
})
export class HealthScoreComponent {
  @Input() score: number = 0;

  getScoreClass(): string {
    if (this.score >= 80) return 'good';
    if (this.score >= 50) return 'warning';
    return 'danger';
  }

  getStrokeDashoffset(): number {
    const circumference = 283;
    return circumference - (this.score / 100) * circumference;
  }

  getScoreDescription(): string {
    if (this.score >= 80) return 'Good architecture health';
    if (this.score >= 50) return 'Some issues detected';
    return 'Significant issues found';
  }
}

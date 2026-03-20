import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthScoreBreakdown, ScoreCategory } from '../../models';

@Component({
  selector: 'app-health-score-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-score-breakdown.component.html',
  styleUrl: './health-score-breakdown.component.css'
})
export class HealthScoreBreakdownComponent {
  @Input() breakdown!: HealthScoreBreakdown;

  expandedCategory: string | null = null;

  toggleCategory(name: string): void {
    this.expandedCategory = this.expandedCategory === name ? null : name;
  }

  getPercentage(category: ScoreCategory): number {
    if (category.maxScore === 0) return 100;
    return Math.round((category.score / category.maxScore) * 100);
  }

  getBarClass(category: ScoreCategory): string {
    const pct = this.getPercentage(category);
    if (pct >= 80) return 'bar-good';
    if (pct >= 50) return 'bar-warning';
    return 'bar-danger';
  }

  getGradeClass(grade: string): string {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'D': return 'grade-d';
      case 'F': return 'grade-f';
      default: return 'grade-f';
    }
  }
}


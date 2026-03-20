import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisDiffResponse, MetricDelta, DoubleDelta, CategoryDelta } from '../../models';

@Component({
  selector: 'app-diff-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diff-banner.component.html',
  styleUrl: './diff-banner.component.css'
})
export class DiffBannerComponent {
  @Input() diff!: AnalysisDiffResponse;

  expandedSection: string | null = null;

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  get healthDeltaClass(): string {
    if (this.diff.healthScoreDelta > 0) return 'delta-positive';
    if (this.diff.healthScoreDelta < 0) return 'delta-negative';
    return 'delta-neutral';
  }

  get healthDeltaIcon(): string {
    if (this.diff.healthScoreDelta > 0) return '↑';
    if (this.diff.healthScoreDelta < 0) return '↓';
    return '→';
  }

  formatDelta(delta: number, inverse = false): string {
    if (delta === 0) return '±0';
    const improved = inverse ? delta < 0 : delta > 0;
    const prefix = delta > 0 ? '+' : '';
    return `${prefix}${delta}`;
  }

  getDeltaClass(delta: number, inverse = false): string {
    if (delta === 0) return 'delta-neutral';
    const improved = inverse ? delta < 0 : delta > 0;
    return improved ? 'delta-positive' : 'delta-negative';
  }

  formatDoubleDelta(delta: number, inverse = false): string {
    if (Math.abs(delta) < 0.005) return '±0.00';
    const prefix = delta > 0 ? '+' : '';
    return `${prefix}${delta.toFixed(2)}`;
  }

  getCategoryBarWidth(score: number, maxScore: number): number {
    if (maxScore === 0) return 100;
    return Math.round((score / maxScore) * 100);
  }

  getCategoryBarClass(score: number, maxScore: number): string {
    const pct = this.getCategoryBarWidth(score, maxScore);
    if (pct >= 80) return 'bar-good';
    if (pct >= 50) return 'bar-warning';
    return 'bar-danger';
  }

  formatPatternType(type: string): string {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
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

  get metricCards(): { label: string; metric: MetricDelta | DoubleDelta; inverse: boolean; isDouble: boolean }[] {
    return [
      { label: 'Anti-Patterns', metric: this.diff.totalAntiPatterns, inverse: true, isDouble: false },
      { label: 'Code Smells', metric: this.diff.totalCodeSmells, inverse: true, isDouble: false },
      { label: 'Critical Issues', metric: this.diff.criticalIssues, inverse: true, isDouble: false },
      { label: 'High Issues', metric: this.diff.highIssues, inverse: true, isDouble: false },
      { label: 'Medium Issues', metric: this.diff.mediumIssues, inverse: true, isDouble: false },
      { label: 'Low Issues', metric: this.diff.lowIssues, inverse: true, isDouble: false },
      { label: 'Lines of Code', metric: this.diff.totalLinesOfCode, inverse: false, isDouble: false },
      { label: 'Services', metric: this.diff.servicesAnalyzed, inverse: false, isDouble: false },
      { label: 'Cycles', metric: this.diff.cycleCount, inverse: true, isDouble: false },
      { label: 'Dependencies', metric: this.diff.totalDependencies, inverse: false, isDouble: false },
      { label: 'Coupling', metric: this.diff.couplingCoefficient, inverse: true, isDouble: true },
    ];
  }
}


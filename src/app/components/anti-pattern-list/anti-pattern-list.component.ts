import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectedAntiPattern } from '../../models';
import { CodeSnippetViewerComponent } from '../code-snippet-viewer/code-snippet-viewer.component';

@Component({
  selector: 'app-anti-pattern-list',
  standalone: true,
  imports: [CommonModule, CodeSnippetViewerComponent],
  templateUrl: './anti-pattern-list.component.html',
  styleUrl: './anti-pattern-list.component.css'
})
export class AntiPatternListComponent {
  @Input() antiPatterns: DetectedAntiPattern[] = [];

  expandedId: number | null = null;

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatPatternType(type: string): string {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  }
}

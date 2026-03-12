import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippet } from '../../models';

interface SnippetLine {
  lineNumber: number;
  code: string;
  isHighlighted: boolean;
}

@Component({
  selector: 'app-code-snippet-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-snippet-viewer.component.html',
  styleUrl: './code-snippet-viewer.component.css'
})
export class CodeSnippetViewerComponent {
  @Input() snippets: CodeSnippet[] = [];
  @Input() maxVisible = 3;

  showAll = false;

  get visibleSnippets(): CodeSnippet[] {
    const list = this.snippets ?? [];
    return this.showAll ? list : list.slice(0, this.maxVisible);
  }

  get hiddenCount(): number {
    return (this.snippets?.length ?? 0) - this.maxVisible;
  }

  getLines(snippet: CodeSnippet): SnippetLine[] {
    return snippet.snippet.split('\n').map((code, i) => {
      const lineNumber = snippet.startLine + i;
      return {
        lineNumber,
        code,
        isHighlighted: lineNumber === snippet.highlightLine
      };
    });
  }

  getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  getFileDir(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '';
  }

  getLanguage(filePath: string): string {
    if (filePath.endsWith('.java')) return 'java';
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'yaml';
    if (filePath.endsWith('.properties')) return 'properties';
    if (filePath.endsWith('.xml')) return 'xml';
    if (filePath.endsWith('.json')) return 'json';
    return 'text';
  }
}


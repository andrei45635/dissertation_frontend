import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DependencyGraph } from '../../models';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-dependency-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dependency-graph.component.html',
  styleUrl: './dependency-graph.component.css'
})
export class DependencyGraphComponent implements OnChanges, AfterViewInit {
  @Input() graph!: DependencyGraph;
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private cy: cytoscape.Core | null = null;

  ngAfterViewInit(): void {
    this.initGraph();
  }

  ngOnChanges(): void {
    if (this.cy && this.graph) {
      this.updateGraph();
    }
  }

  private initGraph(): void {
    if (!this.graph || !this.graphContainer) return;

    const elements: cytoscape.ElementDefinition[] = [
      ...this.graph.nodes.map(node => ({
        data: { 
          id: node.id, 
          label: node.name,
          size: Math.max(30, Math.min(60, node.linesOfCode / 100))
        }
      })),
      ...this.graph.edges.map((edge, index) => ({
        data: { 
          id: `edge-${index}`,
          source: edge.source, 
          target: edge.target,
          weight: edge.weight
        }
      }))
    ];

    this.cy = cytoscape({
      container: this.graphContainer.nativeElement,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4f46e5',
            'label': 'data(label)',
            'color': '#1e293b',
            'font-size': '12px',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'width': 'data(size)',
            'height': 'data(size)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: () => 150,
        nodeRepulsion: () => 8000,
        padding: 50
      }
    });
  }

  private updateGraph(): void {
    if (!this.cy) {
      this.initGraph();
    }
  }

  resetZoom(): void {
    this.cy?.fit();
  }
}

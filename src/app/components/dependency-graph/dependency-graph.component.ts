import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
export class DependencyGraphComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() graph!: DependencyGraph;
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private cy: cytoscape.Core | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph'] && this.viewReady) {
      this.renderGraph();
    }
  }

  ngOnDestroy(): void {
    this.cy?.destroy();
    this.cy = null;
  }

  private renderGraph(): void {
    if (!this.graph || !this.graphContainer) return;

    // Destroy previous instance to avoid stale state
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }

    // Coerce ALL ids to strings so edges always match nodes.
    // Java backends may serialize Long ids as numbers in JSON,
    // causing Cytoscape to silently drop edges with no matching node.
    const elements: cytoscape.ElementDefinition[] = [
      ...this.graph.nodes.map(node => ({
        data: {
          id: String(node.id),
          label: node.name,
          size: Math.max(30, Math.min(60, node.linesOfCode / 100))
        }
      })),
      ...this.graph.edges.map((edge, index) => ({
        data: {
          id: `edge-${index}`,
          source: String(edge.source),
          target: String(edge.target),
          label: edge.type,
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


  resetZoom(): void {
    this.cy?.fit();
  }
}

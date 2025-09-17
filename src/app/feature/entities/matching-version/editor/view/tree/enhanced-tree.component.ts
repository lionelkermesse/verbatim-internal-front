import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { ISpeaker } from '@chd-digital-verbatim-front/core/models';
import {
  EnhancedTreeNode, TreeNodeAction, TreeSelectionEvent
} from '@chd-digital-verbatim-front/feature/entities/matching-version/editor/matching-editor.models';
import { getStatusColor } from '@chd-digital-verbatim-front/shared/util';

@Component({
  selector: 'chd-enhanced-tree',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
    NzInputModule,
    NzToolTipModule,
    NzCardModule,
    NzDividerModule
  ],
  templateUrl: './enhanced-tree.component.html',
  styleUrls: ['./enhanced-tree.component.scss']
})
export class EnhancedTreeComponent {
  readonly treeNodes = input.required<EnhancedTreeNode[]>();
  // Enhanced Tree is READ-ONLY - no editing functionality
  readonly canEdit = input<boolean>(false);

  // Utils
  readonly getStatusColor = getStatusColor;

  // Outputs (read-only operations only)
  readonly onNodeSelect = output<TreeSelectionEvent>();
  readonly onNodeExpand = output<{ node: EnhancedTreeNode; expanded: boolean }>();

  // Enhanced Tree is READ-ONLY - no editing state needed

  // Flatten tree for easier rendering and better performance
  readonly displayNodes = computed(() => {
    return this.flattenNodes(this.treeNodes());
  });

  private flattenNodes(nodes: EnhancedTreeNode[]): EnhancedTreeNode[] {
    const result: EnhancedTreeNode[] = [];

    for (const node of nodes) {
      // Always include the node itself
      result.push(node);

      // Include children only when the node is expanded
      if (node.isExpanded && node.inners && node.inners.length > 0) {
        result.push(...this.flattenNodes(node.inners as EnhancedTreeNode[]));
      }
    }

    return result;
  }

  trackByNode(index: number, node: EnhancedTreeNode): number {
    return node.id;
  }

  onNodeClick(node: EnhancedTreeNode): void {
    const event: TreeSelectionEvent = {
      selectedNode: node,
      previousNode: null,
      selectionSource: 'click'
    };
    this.onNodeSelect.emit(event);
  }

  onToggleExpansion(node: EnhancedTreeNode): void {
    const newExpanded = !node.isExpanded;

    this.onNodeExpand.emit({
      node,
      expanded: newExpanded
    });
  }

  // Enhanced Tree is READ-ONLY - no editing methods needed

  getSpeakerDisplayName(speaker: ISpeaker): string {
    return speaker.fullName || `${speaker.firstName} ${speaker.lastName}`;
  }

  private findNodeById(id: number): EnhancedTreeNode | null {
    return this.findInNodes(this.treeNodes(), id);
  }

  private findInNodes(nodes: EnhancedTreeNode[], id: number): EnhancedTreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.inners && node.inners.length > 0) {
        const found = this.findInNodes(node.inners as EnhancedTreeNode[], id);
        if (found) return found;
      }
    }
    return null;
  }

}

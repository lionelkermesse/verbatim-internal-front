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

import { EnhancedTreeNode, TreeSelectionEvent, TreeNodeAction } from '../../models/matching-editor.models';
import { ISpeaker } from '@chd-digital-verbatim-front/core/models';

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
  readonly canEdit = input<boolean>(false);
  readonly inlineEditMode = input<boolean>(true);

  // Outputs
  readonly onNodeSelect = output<TreeSelectionEvent>();
  readonly onNodeExpand = output<{ node: EnhancedTreeNode; expanded: boolean }>();
  readonly onNodeAction = output<{ action: TreeNodeAction; node: EnhancedTreeNode }>();
  readonly onInlineEdit = output<{ node: EnhancedTreeNode; field: string; value: string }>();

  // Inline editing state
  private readonly editingState = signal<{
    nodeId: number | null;
    field: 'title' | 'verbatim' | null;
    originalValue: string;
  }>({
    nodeId: null,
    field: null,
    originalValue: ''
  });

  readonly editingValue = signal<string>('');

  // Flatten tree for easier rendering and better performance
  readonly displayNodes = computed(() => {
    return this.flattenNodes(this.treeNodes());
  });

  private flattenNodes(nodes: EnhancedTreeNode[]): EnhancedTreeNode[] {
    const result: EnhancedTreeNode[] = [];

    for (const node of nodes) {
      result.push(node);
      // Show all child events regardless of expansion state, just like flattened view
      if (node.inners && node.inners.length > 0) {
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

  onActionClick(action: TreeNodeAction, node: EnhancedTreeNode): void {
    this.onNodeAction.emit({ action, node });
  }

  startInlineEdit(node: EnhancedTreeNode, field: 'title' | 'verbatim'): void {
    if (!this.canEdit() || !this.inlineEditMode()) return;

    const originalValue = field === 'title' ? node.title : (node.verbatim || '');

    this.editingState.set({
      nodeId: node.id,
      field,
      originalValue
    });

    this.editingValue.set(originalValue);
  }

  commitEdit(): void {
    const state = this.editingState();
    if (!state.nodeId || !state.field) return;

    const node = this.findNodeById(state.nodeId);
    if (!node) return;

    const newValue = this.editingValue();
    if (newValue !== state.originalValue) {
      this.onInlineEdit.emit({
        node,
        field: state.field,
        value: newValue
      });
    }

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingState.set({
      nodeId: null,
      field: null,
      originalValue: ''
    });
    this.editingValue.set('');
  }

  updateEditingValue(value: string): void {
    this.editingValue.set(value);
  }

  isEditingTitle(node: EnhancedTreeNode): boolean {
    const state = this.editingState();
    return state.nodeId === node.id && state.field === 'title';
  }

  isEditingVerbatim(node: EnhancedTreeNode): boolean {
    const state = this.editingState();
    return state.nodeId === node.id && state.field === 'verbatim';
  }

  getVisibleActions(node: EnhancedTreeNode): TreeNodeAction[] {
    return node.actions.filter(action => action.visible && !action.disabled);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AUTOMATICALLY_MATCHED': return 'green';
      case 'MANUALLY_MATCHED': return 'blue';
      case 'UNMATCHED': return 'orange';
      case 'MATCHING_CONFLICT': return 'red';
      default: return 'default';
    }
  }

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

import {Component, computed, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

// ng-zorro imports
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import {ISpeaker} from '@chd-digital-verbatim-front/core/models';
import {
  EnhancedTreeNode,
  TreeNodeAction,
  TreeSelectionEvent
} from '@chd-digital-verbatim-front/feature/entities/matching-version/editor/matching-editor.models';
import {getStatusColor} from '@chd-digital-verbatim-front/shared/util';

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
    NzDividerModule,
    NzPopconfirmModule
  ],
  templateUrl: './enhanced-tree.component.html',
  styleUrls: ['./enhanced-tree.component.scss']
})
export class EnhancedTreeComponent {
  readonly treeNodes = input.required<EnhancedTreeNode[]>();
  readonly canEdit = input<boolean>(false);

  // Utils
  readonly getStatusColor = getStatusColor;

  // Outputs
  readonly onNodeSelect = output<TreeSelectionEvent>();
  readonly onNodeExpand = output<{ node: EnhancedTreeNode; expanded: boolean }>();
  readonly onNodeAction = output<{ action: TreeNodeAction; node: EnhancedTreeNode }>();
  readonly onInlineEdit = output<{ node: EnhancedTreeNode; field: string; value: string }>();

  // Edit state
  readonly inlineEditNode = signal<EnhancedTreeNode | null>(null);
  readonly inlineEditField = signal<string>('');
  readonly inlineEditValue = signal<string>('');

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

  onNodeActionClick(action: TreeNodeAction, node: EnhancedTreeNode, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.onNodeAction.emit({action, node});
  }

  onInlineEditStart(node: EnhancedTreeNode, field: string): void {
    if (!this.canEdit()) return;

    this.inlineEditNode.set(node);
    this.inlineEditField.set(field);
    this.inlineEditValue.set(field === 'title' ? (node.title || '') : (node.verbatim || ''));
  }

  onInlineEditSave(node: EnhancedTreeNode): void {
    if (!this.inlineEditNode() || this.inlineEditField() === '') return;

    this.onInlineEdit.emit({
      node: node,
      field: this.inlineEditField(),
      value: this.inlineEditValue()
    });

    this.onInlineEditCancel();
  }

  onInlineEditCancel(): void {
    this.inlineEditNode.set(null);
    this.inlineEditField.set('');
    this.inlineEditValue.set('');
  }

  isEditingField(node: EnhancedTreeNode, field: string): boolean {
    return this.inlineEditNode() === node && this.inlineEditField() === field;
  }

  getVisibleActions(node: EnhancedTreeNode): TreeNodeAction[] {
    return node.actions?.filter(action => action.visible && !action.disabled) || [];
  }

  getSpeakerDisplayName(speaker: ISpeaker): string {
    return `${speaker.firstName} ${speaker.lastName}`;
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

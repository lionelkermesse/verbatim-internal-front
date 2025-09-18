import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// CDK imports for drag & drop
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// ng-zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { EnhancedTreeNode, TreeNodeAction, TreeSelectionEvent } from '../../matching-editor.models';

@Component({
  selector: 'chd-flattened-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DragDropModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
    NzToolTipModule,
    NzPopconfirmModule,
  ],
  templateUrl: './flattened-view.component.html',
  styleUrls: ['./flattened-view.component.scss']
})
export class FlattenedViewComponent {
  nodes = input<EnhancedTreeNode[]>([]);
  canEdit = input<boolean>(false);
  statusColorFn = input<(status: string) => string>(() => 'default');
  actionProvider = input<(node: EnhancedTreeNode) => TreeNodeAction[]>(() => []);

  nodeSelect = output<TreeSelectionEvent>();
  nodeExpand = output<{ node: EnhancedTreeNode; expanded: boolean }>();
  nodeAction = output<{ action: TreeNodeAction; node: EnhancedTreeNode }>();
  nodeDrop = output<{ event: CdkDragDrop<EnhancedTreeNode[]>; nodes: EnhancedTreeNode[]; dragDropOperation?: any }>();

  trackByNode(index: number, node: EnhancedTreeNode): number {
    return node.id;
  }

  onSelect(node: EnhancedTreeNode): void {
    this.nodeSelect.emit({ selectedNode: node, previousNode: null, selectionSource: 'click' });
  }

  onExpand(node: EnhancedTreeNode): void {
    this.nodeExpand.emit({ node, expanded: !node.isExpanded });
  }

  onAction(action: TreeNodeAction, node: EnhancedTreeNode, $event?: MouseEvent): void {
    if ($event) { $event.stopPropagation(); }
    // Special case: remove speaker
    if (action.type === 'remove-speaker' && typeof action.speakerIndex === 'number') {
      this.nodeAction.emit({ action: { ...action, type: 'remove-speaker' }, node });
      return;
    }
    this.nodeAction.emit({ action, node });
  }

  onSetAsRoot(node: EnhancedTreeNode, $event?: MouseEvent): void {
    if ($event) { $event.stopPropagation(); }
    const setAsRootAction: TreeNodeAction = {
      type: 'set-as-root',
      icon: 'arrow-up',
      tooltip: 'Set as root event',
      visible: true,
      disabled: false
    };
    this.nodeAction.emit({ action: setAsRootAction, node });
  }

  onDrop(event: CdkDragDrop<EnhancedTreeNode[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      console.log('Drag & Drop - Previous index:', event.previousIndex, 'Current index:', event.currentIndex);

      // Create DragDropOperation for the state service
      const sourceNode = this.nodes()[event.previousIndex];
      const targetIndex = event.currentIndex;

      const dragDropOperation = {
        sourceId: sourceNode.id,
        targetId: -1, // Will be set by state service
        operation: 'reorder' as 'move-before' | 'move-after' | 'move-into' | 'reorder',
        sourceIndex: event.previousIndex,
        targetIndex: targetIndex
      };

      this.nodeDrop.emit({ event, nodes: this.nodes(), dragDropOperation });
    }
  }

}

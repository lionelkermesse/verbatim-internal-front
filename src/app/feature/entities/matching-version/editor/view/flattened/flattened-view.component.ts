import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { EnhancedTreeNode, TreeNodeAction, TreeSelectionEvent } from '../../matching-editor.models';

@Component({
  selector: 'chd-flattened-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
    NzToolTipModule,
  ],
  templateUrl: './flattened-view.component.html',
  styleUrls: ['./flattened-view.component.scss']
})
export class FlattenedViewComponent {
  @Input() nodes: EnhancedTreeNode[] = [];
  @Input() canEdit: boolean = false;
  @Input() statusColorFn: (status: string) => string = () => 'default';
  @Input() actionProvider: (node: EnhancedTreeNode) => TreeNodeAction[] = () => [];

  @Output() nodeSelect = new EventEmitter<TreeSelectionEvent>();
  @Output() nodeExpand = new EventEmitter<{ node: EnhancedTreeNode; expanded: boolean }>();
  @Output() nodeAction = new EventEmitter<{ action: TreeNodeAction; node: EnhancedTreeNode }>();

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
    this.nodeAction.emit({ action, node });
  }
}

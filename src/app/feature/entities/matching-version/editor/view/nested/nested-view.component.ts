import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { EnhancedTreeNode, TreeSelectionEvent } from '../../matching-editor.models';

@Component({
  selector: 'chd-nested-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzCardModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
  ],
  templateUrl: './nested-view.component.html',
  styleUrls: ['./nested-view.component.scss']
})
export class NestedViewComponent {
  @Input() nodes: EnhancedTreeNode[] = [];
  @Input() statusColorFn: (status: string) => string = () => 'default';

  @Output() nodeSelect = new EventEmitter<TreeSelectionEvent>();

  onSelect(node: EnhancedTreeNode): void {
    this.nodeSelect.emit({ selectedNode: node, previousNode: null, selectionSource: 'click' });
  }
}

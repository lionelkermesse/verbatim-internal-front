import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { IMatchingResult, IMatchingResultItem } from '@chd-digital-verbatim-front/core/models';

@Component({
  selector: 'app-matching-tree',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzTreeModule,
    NzIconModule,
    NzSpaceModule,
  ],
  templateUrl: './matching-tree.component.html',
  styleUrls: ['./matching-tree.component.scss']
})
export class MatchingTreeComponent implements OnChanges {
  @Input() matchingResult: IMatchingResult | null = null;
  @Output() eventSelected = new EventEmitter<IMatchingResultItem>();

  readonly treeNodes = signal<NzTreeNodeOptions[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matchingResult']) {
      this.buildTreeNodes();
    }
  }

  private buildTreeNodes(): void {
    if (!this.matchingResult || !this.matchingResult.result) {
      this.treeNodes.set([]);
      return;
    }
    const nodes = this.matchingResult.result.map(item => this.itemToTreeNode(item));
    this.treeNodes.set(nodes);
  }

  private itemToTreeNode(item: IMatchingResultItem): NzTreeNodeOptions {
    return {
      title: item.title,
      key: item.id.toString(),
      expanded: true,
      children: item.inners?.map(inner => this.itemToTreeNode(inner)) || [],
      isLeaf: !item.inners || item.inners.length === 0,
      origin: item,
    };
  }

  onNodeClick(event: any): void {
    if (event.node && event.node.origin) {
      this.eventSelected.emit(event.node.origin);
    }
  }

  onEdit(item: IMatchingResultItem): void {
    // TODO: Implement edit logic
  }

  onDelete(item: IMatchingResultItem): void {
    // TODO: Implement delete logic
  }

  onAdd(item: IMatchingResultItem): void {
    // TODO: Implement add logic
  }
}

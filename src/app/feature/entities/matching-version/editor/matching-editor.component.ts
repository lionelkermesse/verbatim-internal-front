import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

// Components
import { EnhancedTreeComponent } from './tree/enhanced-tree.component';
import { MatchingEditorStateService } from '../services/matching-editor-state.service';
import { MatchingVersionService } from '../matching-version.service';
import {
  EnhancedTreeNode,
  TreeSelectionEvent,
  TreeNodeAction,
  MatchingEditorConfig
} from '../models/matching-editor.models';
import { IMatchingVersion } from '../matching-version-chd.model';

type ViewType = 'enhanced-tree' | 'accordion' | 'nested-cards' | 'table-tree';

@Component({
  selector: 'chd-matching-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzTypographyModule,
    NzSpaceModule,
    NzTagModule,
    NzSwitchModule,
    NzSegmentedModule,
    NzToolTipModule,
    NzDividerModule,
    NzProgressModule,
    NzCollapseModule,
    EnhancedTreeComponent
  ],
  templateUrl: './matching-editor.component.html',
  styleUrls: ['./matching-editor.component.scss']
})
export class MatchingEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(MatchingEditorStateService);
  private readonly matchingVersionService = inject(MatchingVersionService);

  // Route parameters
  readonly sessionIdentifier = signal<string>('');
  readonly version = signal<number>(0);
  readonly isEditMode = signal<boolean>(false);

  // View state
  readonly currentViewType = signal<ViewType>('enhanced-tree');
  readonly showConfig = signal<boolean>(false);

  // State from service
  readonly state = this.stateService.state;
  readonly currentMatchingVersion = this.stateService.currentMatchingVersion;
  readonly treeNodes = this.stateService.treeNodes;
  readonly selectedItem = this.stateService.selectedItem;
  readonly config = this.stateService.config;
  readonly validationResult = this.stateService.validationResult;
  readonly canSave = this.stateService.canSave;
  readonly canEdit = this.stateService.canEdit;

  // View options
  readonly viewOptions = [
    { label: 'Enhanced Tree', value: 'enhanced-tree', icon: 'node-index' },
    { label: 'Accordion View', value: 'accordion', icon: 'menu-fold' },
    { label: 'Nested Cards', value: 'nested-cards', icon: 'layout' },
    { label: 'Table Tree', value: 'table-tree', icon: 'table' }
  ];

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    const version = this.route.snapshot.paramMap.get('version');
    const editMode = this.route.snapshot.data['editMode'] || false;

    if (sessionIdentifier && version) {
      this.sessionIdentifier.set(sessionIdentifier);
      this.version.set(+version);
      this.isEditMode.set(editMode);

      // Set edit mode in state service
      this.stateService.setEditMode(editMode ? 'edit' : 'view');

      // Load matching data
      this.stateService.loadMatchingData(sessionIdentifier, +version);
    } else {
      this.router.navigate(['/sessions']);
    }
  }

  onViewTypeChange(viewType: ViewType): void {
    this.currentViewType.set(viewType);
  }

  onNodeSelect(event: TreeSelectionEvent): void {
    if (event.selectedNode) {
      this.stateService.selectItem(event.selectedNode.id);
    }
  }

  onNodeExpand(event: { node: EnhancedTreeNode; expanded: boolean }): void {
    this.stateService.toggleExpansion(event.node.id);
  }

  onNodeAction(event: { action: TreeNodeAction; node: EnhancedTreeNode }): void {
    switch (event.action.type) {
      case 'edit':
        this.onEditItem(event.node);
        break;
      case 'add-child':
        this.stateService.addItem(event.node.id);
        break;
      case 'delete':
        this.stateService.deleteItem(event.node.id);
        break;
      case 'move-up':
      case 'move-down':
        // Implement move operations
        console.log('Move operation:', event.action.type, event.node.id);
        break;
    }
  }

  onInlineEdit(event: { node: EnhancedTreeNode; field: string; value: string }): void {
    this.stateService.updateItemField(event.node.id, event.field, event.value);
  }

  onEditItem(node: EnhancedTreeNode): void {
    // For now, just select the item - could open a detail panel
    this.stateService.selectItem(node.id);
  }

  onSave(): void {
    const sessionIdentifier = this.sessionIdentifier();
    if (sessionIdentifier) {
      this.stateService.saveChanges(sessionIdentifier);
    }
  }

  onValidate(): void {
    const matchingVersion = this.currentMatchingVersion();
    if (!matchingVersion || !matchingVersion.sessionIdentifier) return;

    const sessionIdentifier = matchingVersion.sessionIdentifier;
    const version = matchingVersion.version || 1;

    this.matchingVersionService.validateMatching(sessionIdentifier, version).subscribe({
      next: (response: any) => {
        const validatedMatchingVersion = response.body;
        if (validatedMatchingVersion) {
          // Navigate back to session detail with success message
          this.router.navigate(['/sessions', sessionIdentifier]);
        }
      },
      error: (error: any) => {
        console.error('Error validating matching:', error);
      }
    });
  }

  onBack(): void {
    const sessionIdentifier = this.sessionIdentifier();
    this.router.navigate(['/sessions', sessionIdentifier]);
  }

  onExpandAll(): void {
    this.stateService.expandAll();
  }

  onCollapseAll(): void {
    this.stateService.collapseAll();
  }

  onAddRootEvent(): void {
    this.stateService.addItem();
  }

  onToggleConfig(): void {
    this.showConfig.set(!this.showConfig());
  }

  onConfigChange(partialConfig: Partial<MatchingEditorConfig>): void {
    this.stateService.updateConfig(partialConfig);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'UPLOADED': return 'purple';
      case 'PROCESSING': return 'blue';
      case 'AWAITING_CORRECTION': return 'orange';
      case 'VALIDATED': return 'green';
      case 'ERROR': return 'red';
      default: return 'default';
    }
  }

  getProgressPercentage(): number {
    const stats = this.stateService.matchingStats();
    return stats.matchedPercentage;
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#1890ff';
    if (percentage >= 40) return '#fa8c16';
    return '#f5222d';
  }

  getCurrentViewIcon(): string {
    const viewType = this.currentViewType();
    const option = this.viewOptions.find(opt => opt.value === viewType);
    return option?.icon || 'node-index';
  }

  getCurrentViewTitle(): string {
    const viewType = this.currentViewType();
    switch (viewType) {
      case 'enhanced-tree': return 'Enhanced Tree View';
      case 'accordion': return 'Accordion View';
      case 'nested-cards': return 'Nested Cards View';
      case 'table-tree': return 'Table Tree View';
      default: return 'Tree View';
    }
  }

  getCurrentViewDescription(): string {
    const viewType = this.currentViewType();
    switch (viewType) {
      case 'enhanced-tree': return 'Modern card-based tree with inline editing';
      case 'accordion': return 'Collapsible accordion panels for easy navigation';
      case 'nested-cards': return 'Visual card layout with nested structure';
      case 'table-tree': return 'Table format with expandable hierarchy';
      default: return 'Hierarchical view of events';
    }
  }

  trackByNode(index: number, node: EnhancedTreeNode): number {
    return node.id;
  }

  getVisibleActions(node: EnhancedTreeNode): TreeNodeAction[] {
    return node.actions?.filter(action => action.visible && !action.disabled) || [];
  }
}

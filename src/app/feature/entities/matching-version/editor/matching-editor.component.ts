import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
import { NzInputModule } from 'ng-zorro-antd/input';

// Components
import { EnhancedTreeComponent } from './tree/enhanced-tree.component';
import { MatchingVersionService } from '../matching-version.service';
import {
  EnhancedTreeNode,
  MatchingEditorConfig,
  TreeNodeAction,
  TreeSelectionEvent
} from '../editor/matching-editor.models';
import {
  MatchingEditorStateService
} from '@chd-digital-verbatim-front/feature/entities/matching-version/editor/matching-editor-state.service';

type ViewType = 'enhanced-tree' | 'flattened-cards' | 'nested-cards';

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
    NzInputModule,
    EnhancedTreeComponent
  ],
  templateUrl: './matching-editor.component.html',
  styleUrls: ['./matching-editor.component.scss']
})
export class MatchingEditorComponent implements OnInit {
  private readonly translate = inject(TranslateService);
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
  readonly detailEditMode = signal<boolean>(false);
  readonly editingTitle = signal<string>('');
  readonly editingVerbatim = signal<string>('');

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
  viewOptions = this.buildViewOptions();

  private buildViewOptions() {
    return [
      { label: this.translate.instant('matching.editor.view.enhancedTree.title'), value: 'enhanced-tree' as ViewType, icon: 'node-index' },
      { label: this.translate.instant('matching.editor.view.flattened.title'), value: 'flattened-cards' as ViewType, icon: 'unordered-list' },
      // { label: this.translate.instant('matching.editor.view.nested.title'), value: 'nested-cards' as ViewType, icon: 'layout' }
    ];
  }

  // Computed property for current view index
  readonly currentViewIndex = computed(() => {
    return this.viewOptions.findIndex(opt => opt.value === this.currentViewType());
  });

  // Computed property for flattened tree nodes
  readonly flattenedNodes = computed(() => {
    const nodes = this.treeNodes();
    const flattened: EnhancedTreeNode[] = [];

    const flattenNode = (node: EnhancedTreeNode, parentDepth = 0) => {
      // Add the current node with proper depth
      const flatNode = { ...node, depth: parentDepth };
      flattened.push(flatNode);

      // Add all children recursively
      if (node.inners && node.inners.length > 0) {
        node.inners.forEach((child, index) => {
          // Transform child to EnhancedTreeNode format
          const childNode: EnhancedTreeNode = {
            ...child,
            index: index,
            depth: parentDepth + 1,
            isExpanded: false,
            isSelected: false,
            isDragSource: false,
            isDragTarget: false,
            hasChildren: !!(child.inners && child.inners.length > 0),
            actions: []
          } as unknown as EnhancedTreeNode;

          flattenNode(childNode, parentDepth + 1);
        });
      }
    };

    // Process all root nodes
    nodes.forEach(rootNode => {
      flattenNode(rootNode, 0);
    });

    return flattened;
  });

  ngOnInit(): void {
    // Rebuild segmented options when language changes
    this.translate.onLangChange.subscribe(() => {
      this.viewOptions = this.buildViewOptions();
    });

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

  onViewTypeChange(selectedIndex: number): void {
    const selectedOption = this.viewOptions[selectedIndex];
    if (selectedOption) {
      this.currentViewType.set(selectedOption.value as ViewType);
    }
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
    // Select the item and enable edit mode
    this.stateService.selectItem(node.id);
    this.detailEditMode.set(true);
    // Initialize editing values
    this.editingTitle.set(node.title || '');
    this.editingVerbatim.set(node.verbatim || '');
  }

  onSaveDetailEdit(): void {
    const selectedItem = this.selectedItem();
    if (!selectedItem) return;

    // Update the item through state service
    this.stateService.updateItemField(selectedItem.id, 'title', this.editingTitle());
    this.stateService.updateItemField(selectedItem.id, 'verbatim', this.editingVerbatim());

    // Exit edit mode
    this.detailEditMode.set(false);
  }

  onCancelDetailEdit(): void {
    // Reset editing values and exit edit mode
    const selectedItem = this.selectedItem();
    if (selectedItem) {
      this.editingTitle.set(selectedItem.title || '');
      this.editingVerbatim.set(selectedItem.verbatim || '');
    }
    this.detailEditMode.set(false);
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
    // Supports both version-level statuses and item-level matching statuses
    switch (status) {
      // Version statuses
      case 'UPLOADED': return 'purple';
      case 'PROCESSING': return 'blue';
      case 'AWAITING_CORRECTION': return 'orange';
      case 'VALIDATED': return 'green';
      case 'ERROR': return 'red';

      // Item (event) matching statuses
      case 'AUTOMATICALLY_MATCHED': return 'green';
      case 'MANUALLY_MATCHED': return 'blue';
      case 'UNMATCHED': return 'orange';
      case 'MATCHING_CONFLICT': return 'red';

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
      case 'enhanced-tree': return 'matching.editor.view.enhancedTree.title';
      case 'flattened-cards': return 'matching.editor.view.flattened.title';
      case 'nested-cards': return 'matching.editor.view.nested.title';
      default: return 'matching.editor.view.enhancedTree.title';
    }
  }

  getCurrentViewDescription(): string {
    const viewType = this.currentViewType();
    switch (viewType) {
      case 'enhanced-tree': return 'matching.editor.view.enhancedTree.description';
      case 'flattened-cards': return 'matching.editor.view.flattened.description';
      case 'nested-cards': return 'matching.editor.view.nested.description';
      default: return 'matching.editor.view.enhancedTree.description';
    }
  }

  trackByNode(index: number, node: EnhancedTreeNode): number {
    return node.id;
  }

  getVisibleActions(node: EnhancedTreeNode): TreeNodeAction[] {
    return node.actions?.filter(action => action.visible && !action.disabled) || [];
  }
}

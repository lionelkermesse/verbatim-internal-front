import { Injectable, computed, signal, inject } from '@angular/core';
import {
  MatchingEditorState,
  EnhancedTreeNode,
  VersionCardData,
  MatchingStats,
  TreeNodeAction,
  DragDropOperation,
  InlineEditState,
  MatchingEditorConfig,
  EditorAction,
  UndoRedoState,
  MatchingValidation,
  ValidationError,
  ValidationWarning,
  DonutChartData,
  MatchingProgressData
} from '../models/matching-editor.models';
import { IMatchingResult, IMatchingResultItem, ISpeaker } from '@chd-digital-verbatim-front/core/models';
import { IMatchingVersion } from '../matching-version-chd.model';
import { MatchingVersionService } from '../matching-version.service';

@Injectable({
  providedIn: 'root'
})
export class MatchingEditorStateService {
  private readonly matchingVersionService = inject(MatchingVersionService);

  // Core state signals
  private readonly _state = signal<MatchingEditorState>({
    matchingResult: null,
    selectedItemId: null,
    expandedKeys: [],
    selectedKeys: [],
    isLoading: false,
    hasChanges: false,
    isSaving: false,
    editMode: 'view',
    dragDropEnabled: false
  });

  private readonly _currentMatchingVersion = signal<IMatchingVersion | null>(null);
  private readonly _treeNodes = signal<EnhancedTreeNode[]>([]);
  private readonly _inlineEditState = signal<InlineEditState>({
    activeField: null,
    activeEventId: null,
    originalValue: '',
    currentValue: '',
    isValid: true
  });

  private readonly _config = signal<MatchingEditorConfig>({
    enableDragDrop: true,
    enableInlineEdit: true,
    autoSave: false,
    autoSaveInterval: 30000,
    showAdvancedActions: true,
    treeViewMode: 'comfortable',
    defaultExpansionLevel: 2
  });

  private readonly _undoRedoState = signal<UndoRedoState>({
    canUndo: false,
    canRedo: false,
    undoStack: [],
    redoStack: []
  });

  // Computed selectors
  readonly state = this._state.asReadonly();
  readonly currentMatchingVersion = this._currentMatchingVersion.asReadonly();
  readonly treeNodes = this._treeNodes.asReadonly();
  readonly inlineEditState = this._inlineEditState.asReadonly();
  readonly config = this._config.asReadonly();
  readonly undoRedoState = this._undoRedoState.asReadonly();

  // Computed derived state
  readonly selectedItem = computed(() => {
    const selectedId = this._state().selectedItemId;
    if (!selectedId) return null;
    return this.findItemById(selectedId, this._treeNodes());
  });

  readonly matchingStats = computed(() => {
    return this.calculateMatchingStats(this._state().matchingResult);
  });

  readonly chartData = computed(() => {
    return this.generateChartData(this.matchingStats());
  });

  readonly validationResult = computed(() => {
    return this.validateMatchingResult(this._state().matchingResult);
  });

  readonly canSave = computed(() => {
    const state = this._state();
    return state.hasChanges && !state.isSaving && this.validationResult().isValid;
  });

  readonly canEdit = computed(() => {
    const version = this._currentMatchingVersion();
    return version?.status !== 'VALIDATED' && this._state().editMode === 'edit';
  });

  // Actions
  loadMatchingData(sessionIdentifier: string, version: number): void {
    this.updateState({ isLoading: true });

    this.matchingVersionService.getMatchingVersion(sessionIdentifier, version).subscribe({
      next: (response) => {
        const matchingVersion = response.body;
        if (matchingVersion) {
          this._currentMatchingVersion.set(matchingVersion);
          this.updateState({
            matchingResult: matchingVersion.matchingResult || { result: [], speakers: [], matched: [], unMatched: [] },
            isLoading: false
          });
          this.rebuildTreeNodes();
          this.expandToDefaultLevel();
        }
      },
      error: (error) => {
        console.error('Error loading matching data:', error);
        this.updateState({ isLoading: false });
      }
    });
  }

  updateState(partialState: Partial<MatchingEditorState>): void {
    this._state.update(current => ({ ...current, ...partialState }));
  }

  selectItem(itemId: number | null): void {
    const currentState = this._state();
    if (currentState.selectedItemId !== itemId) {
      this.updateState({
        selectedItemId: itemId,
        selectedKeys: itemId ? [itemId.toString()] : []
      });
    }
  }

  toggleExpansion(itemId: number): void {
    const currentKeys = this._state().expandedKeys;
    const itemKey = itemId.toString();

    if (currentKeys.includes(itemKey)) {
      this.updateState({
        expandedKeys: currentKeys.filter(key => key !== itemKey)
      });
    } else {
      this.updateState({
        expandedKeys: [...currentKeys, itemKey]
      });
    }

    this.rebuildTreeNodes();
  }

  expandAll(): void {
    const allKeys = this.getAllItemKeys(this._treeNodes());
    this.updateState({ expandedKeys: allKeys });
    this.rebuildTreeNodes();
  }

  collapseAll(): void {
    this.updateState({ expandedKeys: [] });
    this.rebuildTreeNodes();
  }

  expandToDefaultLevel(): void {
    const defaultLevel = this._config().defaultExpansionLevel;
    const keysToExpand = this.getKeysUpToLevel(this._treeNodes(), defaultLevel);
    this.updateState({ expandedKeys: keysToExpand });
    this.rebuildTreeNodes();
  }

  setEditMode(mode: 'view' | 'edit'): void {
    this.updateState({
      editMode: mode,
      dragDropEnabled: mode === 'edit' && this._config().enableDragDrop
    });
  }

  startInlineEdit(eventId: number, field: 'title' | 'verbatim', currentValue: string): void {
    this._inlineEditState.set({
      activeField: field,
      activeEventId: eventId,
      originalValue: currentValue,
      currentValue: currentValue,
      isValid: true
    });
  }

  updateInlineEdit(newValue: string): void {
    const current = this._inlineEditState();
    this._inlineEditState.set({
      ...current,
      currentValue: newValue,
      isValid: this.validateInlineEdit(newValue, current.activeField)
    });
  }

  commitInlineEdit(): void {
    const editState = this._inlineEditState();
    if (editState.activeEventId && editState.activeField && editState.isValid) {
      this.updateItemField(editState.activeEventId, editState.activeField, editState.currentValue);
      this.cancelInlineEdit();
    }
  }

  cancelInlineEdit(): void {
    this._inlineEditState.set({
      activeField: null,
      activeEventId: null,
      originalValue: '',
      currentValue: '',
      isValid: true
    });
  }

  updateItemField(itemId: number, field: string, value: any): void {
    const currentResult = this._state().matchingResult;
    if (!currentResult) return;

    const updatedResult = this.updateItemInTree(currentResult, itemId, field, value);
    this.updateState({
      matchingResult: updatedResult,
      hasChanges: true
    });
    this.rebuildTreeNodes();
    this.addToUndoStack({ type: 'UPDATE_FIELD', payload: { itemId, field, value }, timestamp: new Date() });
  }

  addItem(parentId?: number): void {
    const currentResult = this._state().matchingResult;
    if (!currentResult) return;

    const newItem: IMatchingResultItem = {
      id: Date.now(),
      title: 'New Event',
      verbatim: '',
      lineNumber: this.getNextLineNumber(parentId),
      inners: [],
      speakers: [],
      status: 'UNMATCHED',
      level: parentId ? this.getItemLevel(parentId) + 1 : 0,
      expand: true
    };

    const updatedResult = this.addItemToTree(currentResult, newItem, parentId);
    this.updateState({
      matchingResult: updatedResult,
      hasChanges: true
    });
    this.rebuildTreeNodes();
    this.selectItem(newItem.id);
    this.addToUndoStack({ type: 'ADD_ITEM', payload: { item: newItem, parentId }, timestamp: new Date() });
  }

  deleteItem(itemId: number): void {
    const currentResult = this._state().matchingResult;
    if (!currentResult) return;

    const updatedResult = this.removeItemFromTree(currentResult, itemId);
    this.updateState({
      matchingResult: updatedResult,
      hasChanges: true,
      selectedItemId: this._state().selectedItemId === itemId ? null : this._state().selectedItemId
    });
    this.rebuildTreeNodes();
    this.addToUndoStack({ type: 'DELETE_ITEM', payload: { itemId }, timestamp: new Date() });
  }

  moveItem(operation: DragDropOperation): void {
    const currentResult = this._state().matchingResult;
    if (!currentResult) return;

    const updatedResult = this.performMoveOperation(currentResult, operation);
    this.updateState({
      matchingResult: updatedResult,
      hasChanges: true
    });
    this.rebuildTreeNodes();
    this.addToUndoStack({ type: 'MOVE_ITEM', payload: operation, timestamp: new Date() });
  }

  assignSpeaker(eventId: number, speaker: ISpeaker): void {
    const item = this.findItemById(eventId, this._treeNodes());
    if (!item) return;

    const updatedSpeakers = [...item.speakers, speaker];
    this.updateItemField(eventId, 'speakers', updatedSpeakers);
  }

  removeSpeaker(eventId: number, speakerIndex: number): void {
    const item = this.findItemById(eventId, this._treeNodes());
    if (!item) return;

    const updatedSpeakers = item.speakers.filter((_, index) => index !== speakerIndex);
    this.updateItemField(eventId, 'speakers', updatedSpeakers);
  }

  saveChanges(sessionIdentifier: string): void {
    const currentVersion = this._currentMatchingVersion();
    const selectedItem = this.selectedItem();

    if (!currentVersion || !selectedItem || !this.canSave()) return;

    this.updateState({ isSaving: true });

    const updateRequest = {
      id: selectedItem.id,
      version: currentVersion.version || 1,
      title: selectedItem.title,
      verbatim: selectedItem.verbatim,
      status: selectedItem.status,
      speakers: selectedItem.speakers
    };

    this.matchingVersionService.updateMatching(sessionIdentifier, updateRequest).subscribe({
      next: (response) => {
        const updatedMatchingVersion = response.body;
        if (updatedMatchingVersion) {
          this._currentMatchingVersion.set(updatedMatchingVersion);
          this.updateState({
            matchingResult: updatedMatchingVersion.matchingResult || { result: [], speakers: [], matched: [], unMatched: [] },
            hasChanges: false,
            isSaving: false
          });
          this.rebuildTreeNodes();
        }
      },
      error: (error) => {
        console.error('Error saving matching:', error);
        this.updateState({ isSaving: false });
      }
    });
  }

  // Private helper methods
  private rebuildTreeNodes(): void {
    const result = this._state().matchingResult;
    if (!result?.result) {
      this._treeNodes.set([]);
      return;
    }

    const expandedKeys = this._state().expandedKeys;
    const selectedKeys = this._state().selectedKeys;
    const editMode = this._state().editMode;

    const nodes = result.result.map(item =>
      this.buildEnhancedTreeNode(item, 0, null, expandedKeys, selectedKeys, editMode)
    );

    this._treeNodes.set(nodes);
  }

  private buildEnhancedTreeNode(
    item: IMatchingResultItem,
    depth: number,
    parentId: number | null,
    expandedKeys: string[],
    selectedKeys: string[],
    editMode: 'view' | 'edit'
  ): EnhancedTreeNode {
    const itemKey = item.id.toString();
    const isExpanded = expandedKeys.includes(itemKey);
    const isSelected = selectedKeys.includes(itemKey);
    const hasChildren = item.inners && item.inners.length > 0;

    const actions: TreeNodeAction[] = this.generateTreeActions(editMode, !!hasChildren);

    const enhancedNode: EnhancedTreeNode = {
      ...item,
      isExpanded,
      isSelected,
      isDragSource: false,
      isDragTarget: false,
      hasChildren: !!hasChildren,
      depth,
      index: 0, // Will be set by parent
      parentId: parentId || undefined,
      actions,
      inners: hasChildren
        ? item.inners!.map((inner, index) => {
            const childNode = this.buildEnhancedTreeNode(inner, depth + 1, item.id, expandedKeys, selectedKeys, editMode);
            childNode.index = index;
            return childNode;
          })
        : []
    };

    return enhancedNode;
  }

  private generateTreeActions(editMode: 'view' | 'edit', hasChildren: boolean): TreeNodeAction[] {
    const baseActions: TreeNodeAction[] = [
      {
        type: 'edit',
        icon: 'edit',
        tooltip: 'Edit event',
        visible: true,
        disabled: editMode === 'view'
      }
    ];

    if (editMode === 'edit') {
      baseActions.push(
        {
          type: 'add-child',
          icon: 'plus',
          tooltip: 'Add sub-event',
          visible: true,
          disabled: false
        },
        {
          type: 'move-up',
          icon: 'up',
          tooltip: 'Move up',
          visible: true,
          disabled: false
        },
        {
          type: 'move-down',
          icon: 'down',
          tooltip: 'Move down',
          visible: true,
          disabled: false
        },
        {
          type: 'delete',
          icon: 'delete',
          tooltip: 'Delete event',
          visible: true,
          disabled: false
        }
      );
    }

    return baseActions;
  }

  private calculateMatchingStats(matchingResult: IMatchingResult | null): MatchingStats {
    if (!matchingResult?.result) {
      return {
        totalEvents: 0,
        matchedCount: 0,
        unmatchedCount: 0,
        conflictCount: 0,
        matchedPercentage: 0,
        unmatchedPercentage: 0,
        conflictPercentage: 0
      };
    }

    const allItems = this.flattenTreeItems(matchingResult.result);
    const totalEvents = allItems.length;

    const matchedCount = allItems.filter(item => item.status === 'AUTOMATICALLY_MATCHED' || item.status === 'MANUALLY_MATCHED').length;
    const unmatchedCount = allItems.filter(item => item.status === 'UNMATCHED').length;
    const conflictCount = allItems.filter(item => item.status === 'MATCHING_CONFLICT').length;

    return {
      totalEvents,
      matchedCount,
      unmatchedCount,
      conflictCount,
      matchedPercentage: totalEvents > 0 ? (matchedCount / totalEvents) * 100 : 0,
      unmatchedPercentage: totalEvents > 0 ? (unmatchedCount / totalEvents) * 100 : 0,
      conflictPercentage: totalEvents > 0 ? (conflictCount / totalEvents) * 100 : 0
    };
  }

  private generateChartData(stats: MatchingStats): DonutChartData[] {
    return [
      {
        name: 'Matched',
        value: stats.matchedCount,
        color: '#52c41a'
      },
      {
        name: 'Unmatched',
        value: stats.unmatchedCount,
        color: '#fa8c16'
      },
      {
        name: 'Conflict',
        value: stats.conflictCount,
        color: '#f5222d'
      }
    ].filter(item => item.value > 0);
  }

  private validateMatchingResult(matchingResult: IMatchingResult | null): MatchingValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!matchingResult?.result) {
      return { isValid: true, errors, warnings };
    }

    const allItems = this.flattenTreeItems(matchingResult.result);

    // Check for items without titles
    allItems.forEach(item => {
      if (!item.title || item.title.trim().length === 0) {
        errors.push({
          id: `empty-title-${item.id}`,
          type: 'empty-title',
          message: 'Event title cannot be empty',
          eventId: item.id,
          severity: 'error'
        });
      }

      if (!item.speakers || item.speakers.length === 0) {
        warnings.push({
          id: `missing-speaker-${item.id}`,
          type: 'missing-speaker',
          message: 'Event has no assigned speakers',
          eventId: item.id,
          severity: 'warning',
          canIgnore: true,
          autoFix: 'Assign available speaker'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateInlineEdit(value: string, field: 'title' | 'verbatim' | null): boolean {
    if (field === 'title') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    return true; // Verbatim can be empty
  }

  private findItemById(id: number, nodes: EnhancedTreeNode[]): EnhancedTreeNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.inners && node.inners.length > 0) {
        const found = this.findItemById(id, node.inners as EnhancedTreeNode[]);
        if (found) return found;
      }
    }
    return null;
  }

  private flattenTreeItems(items: IMatchingResultItem[]): IMatchingResultItem[] {
    const result: IMatchingResultItem[] = [];

    for (const item of items) {
      result.push(item);
      if (item.inners && item.inners.length > 0) {
        result.push(...this.flattenTreeItems(item.inners));
      }
    }

    return result;
  }

  private getAllItemKeys(nodes: EnhancedTreeNode[]): string[] {
    const keys: string[] = [];

    for (const node of nodes) {
      keys.push(node.id.toString());
      if (node.inners && node.inners.length > 0) {
        keys.push(...this.getAllItemKeys(node.inners as EnhancedTreeNode[]));
      }
    }

    return keys;
  }

  private getKeysUpToLevel(nodes: EnhancedTreeNode[], maxLevel: number): string[] {
    const keys: string[] = [];

    for (const node of nodes) {
      if (node.depth < maxLevel) {
        keys.push(node.id.toString());
      }
      if (node.inners && node.inners.length > 0 && node.depth < maxLevel - 1) {
        keys.push(...this.getKeysUpToLevel(node.inners as EnhancedTreeNode[], maxLevel));
      }
    }

    return keys;
  }

  private updateItemInTree(result: IMatchingResult, itemId: number, field: string, value: any): IMatchingResult {
    const updateItem = (items: IMatchingResultItem[]): IMatchingResultItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        if (item.inners && item.inners.length > 0) {
          return { ...item, inners: updateItem(item.inners) };
        }
        return item;
      });
    };

    return {
      ...result,
      result: updateItem(result.result)
    };
  }

  private addItemToTree(result: IMatchingResult, newItem: IMatchingResultItem, parentId?: number): IMatchingResult {
    if (!parentId) {
      return {
        ...result,
        result: [...result.result, newItem]
      };
    }

    const addToParent = (items: IMatchingResultItem[]): IMatchingResultItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            inners: [...(item.inners || []), newItem]
          };
        }
        if (item.inners && item.inners.length > 0) {
          return { ...item, inners: addToParent(item.inners) };
        }
        return item;
      });
    };

    return {
      ...result,
      result: addToParent(result.result)
    };
  }

  private removeItemFromTree(result: IMatchingResult, itemId: number): IMatchingResult {
    const removeItem = (items: IMatchingResultItem[]): IMatchingResultItem[] => {
      return items.filter(item => {
        if (item.id === itemId) {
          return false;
        }
        if (item.inners && item.inners.length > 0) {
          item.inners = removeItem(item.inners);
        }
        return true;
      });
    };

    return {
      ...result,
      result: removeItem(result.result)
    };
  }

  private performMoveOperation(result: IMatchingResult, operation: DragDropOperation): IMatchingResult {
    // Implementation for drag-drop operations would go here
    // This is a complex operation that requires careful handling of tree structure
    console.log('Move operation:', operation);
    return result;
  }

  private getNextLineNumber(parentId?: number): number {
    // Logic to calculate the next line number
    return Date.now(); // Temporary implementation
  }

  private getItemLevel(itemId: number): number {
    const item = this.findItemById(itemId, this._treeNodes());
    return item?.depth || 0;
  }

  private addToUndoStack(action: EditorAction): void {
    const current = this._undoRedoState();
    const newUndoStack = [...current.undoStack.slice(-9), action]; // Keep last 10 actions

    this._undoRedoState.set({
      canUndo: true,
      canRedo: false,
      undoStack: newUndoStack,
      redoStack: []
    });
  }

  // Public utility methods
  createVersionCardData(matchingVersion: IMatchingVersion): VersionCardData {
    const stats = this.calculateMatchingStats(matchingVersion.matchingResult || null);

    return {
      id: matchingVersion.id || 0,
      version: matchingVersion.version || 1,
      createdAt: matchingVersion.createdAt ? matchingVersion.createdAt.toDate() : new Date(),
      status: matchingVersion.status || 'UPLOADED',
      matchingStats: stats,
      canEdit: matchingVersion.status !== 'VALIDATED',
      canDelete: matchingVersion.status !== 'VALIDATED',
      canExport: true
    };
  }

  updateConfig(partialConfig: Partial<MatchingEditorConfig>): void {
    this._config.update(current => ({ ...current, ...partialConfig }));
  }
}

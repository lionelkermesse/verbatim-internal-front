import {IMatchingResult, IMatchingResultItem} from '@chd-digital-verbatim-front/core/models';

export type EditModeType = 'view' | 'edit';
export type NodeActionType =
  'edit'
  | 'delete'
  | 'add-child'
  | 'move-up'
  | 'move-down'
  | 'duplicate'
  | 'set-as-root'
  | 'remove-speaker';
export type DragDropOperationType = 'move-before' | 'move-after' | 'move-into' | 'reorder';

// Enhanced matching editor models
export interface MatchingEditorState {
  matchingResult: IMatchingResult | null;
  selectedItemId: number | null;
  expandedKeys: string[];
  selectedKeys: string[];
  isLoading: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  editMode: EditModeType;
  dragDropEnabled: boolean;
}

export interface VersionCardData {
  id: number;
  version: number;
  createdAt: Date;
  status: string;
  matchingStats: MatchingStats;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface MatchingStats {
  totalEvents: number;
  matchedCount: number;
  unmatchedCount: number;
  conflictCount: number;
  matchedPercentage: number;
  unmatchedPercentage: number;
  conflictPercentage: number;
}

export interface TreeNodeAction {
  type: NodeActionType;
  icon: string;
  tooltip: string;
  visible: boolean;
  disabled: boolean;
  speakerIndex?: number;
}

export interface EnhancedTreeNode extends IMatchingResultItem {
  // Additional properties for tree visualization
  isExpanded: boolean;
  isSelected: boolean;
  isDragSource: boolean;
  isDragTarget: boolean;
  hasChildren: boolean;
  depth: number;
  index: number;
  parentId?: number;
  actions: TreeNodeAction[];
}

export interface DragDropOperation {
  sourceId: number;
  targetId: number;
  operation: DragDropOperationType;
  sourceIndex: number;
  targetIndex: number;
}

export interface SpeakerAssignment {
  speakerId: string;
  eventId: number;
  assignmentType: 'primary' | 'secondary';
  confidence: number;
}

export interface MatchingValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  type: 'missing-speaker' | 'empty-title' | 'duplicate-event' | 'invalid-hierarchy';
  message: string;
  eventId?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning extends ValidationError {
  canIgnore: boolean;
  autoFix?: string;
}

export interface InlineEditState {
  activeField: 'title' | 'verbatim' | null;
  activeEventId: number | null;
  originalValue: string;
  currentValue: string;
  isValid: boolean;
}

export interface MatchingEditorConfig {
  enableDragDrop: boolean;
  enableInlineEdit: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  showAdvancedActions: boolean;
  treeViewMode: 'compact' | 'comfortable' | 'spacious';
  defaultExpansionLevel: number;
}

// Chart data interfaces
export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

export interface MatchingProgressData {
  matched: DonutChartData;
  unmatched: DonutChartData;
  conflict: DonutChartData;
}

// Action interfaces
export interface EditorAction {
  type: string;
  payload?: any;
  timestamp: Date;
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoStack: EditorAction[];
  redoStack: EditorAction[];
}

// Event interfaces for component communication
export interface TreeSelectionEvent {
  selectedNode: EnhancedTreeNode | null;
  previousNode: EnhancedTreeNode | null;
  selectionSource: 'click' | 'keyboard' | 'programmatic';
}

export interface TreeExpansionEvent {
  expandedKeys: string[];
  expandedNodes: EnhancedTreeNode[];
  action: 'expand' | 'collapse' | 'expand-all' | 'collapse-all';
}

export interface ItemEditEvent {
  eventId: number;
  field: string;
  oldValue: any;
  newValue: any;
  isValid: boolean;
}

// Filter and search interfaces
export interface MatchingFilter {
  status?: string[];
  speakers?: string[];
  textSearch?: string;
  level?: number[];
  hasConflicts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  eventId: number;
  matchType: 'title' | 'verbatim' | 'speaker';
  matchText: string;
  highlightStart: number;
  highlightEnd: number;
}

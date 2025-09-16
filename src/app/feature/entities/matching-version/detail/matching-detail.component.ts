import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzTreeModule, NzTreeNodeOptions, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { MatchingVersionService } from '../matching-version.service';
import { IMatchingVersion } from '../matching-version-chd.model';
import { VersionStatus, IMatchingResult, IMatchingResultItem, ISpeaker } from '@chd-digital-verbatim-front/core/models';
import { getStatusColor } from '@chd-digital-verbatim-front/shared/util';

@Component({
  selector: 'chd-matching-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NzTreeModule,
    NzButtonModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzTypographyModule,
    NzGridModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzDrawerModule,
    NzFormModule,
    NzSpinModule,
  ],
  templateUrl: './matching-detail.component.html',
  styleUrls: ['./matching-detail.component.scss'],
})
export class MatchingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchingVersionService = inject(MatchingVersionService);
  private readonly fb = inject(FormBuilder);

  // Component state
  readonly matchingVersion = signal<IMatchingVersion | null>(null);
  readonly matchingResult = signal<IMatchingResult | null>(null);
  readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  readonly selectedItem = signal<IMatchingResultItem | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly hasChanges = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly getStatusColor = getStatusColor;

  // Edit drawer state
  readonly editDrawerVisible = signal<boolean>(false);
  editForm!: FormGroup;

  // Tree expansion state
  readonly expandedKeys = signal<string[]>([]);
  readonly selectedKeys = signal<string[]>([]);

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    const version = this.route.snapshot.paramMap.get('version');
    const editMode = this.route.snapshot.data['editMode'] || false;

    this.isEditMode.set(editMode);

    if (sessionIdentifier && version) {
      this.loadMatchingData(sessionIdentifier, +version);
    }

    this.initializeEditForm();
  }

  private loadMatchingData(sessionIdentifier: string, version: number): void {
    this.isLoading.set(true);

    this.matchingVersionService.getMatchingVersion(sessionIdentifier, version).subscribe({
      next: (response) => {
        const matchingVersion = response.body;
        if (matchingVersion) {
          this.matchingVersion.set(matchingVersion);
          this.matchingResult.set(matchingVersion.matchingResult || { result: [], speakers: [], matched: [], unMatched: [] });
          this.buildTreeNodes();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading matching data:', error);
        this.isLoading.set(false);
      }
    });
  }

  private buildTreeNodes(): void {
    const result = this.matchingResult();
    if (!result || !result.result) {
      console.log('No matching result data available');
      return;
    }

    console.log('Building tree nodes from result:', result.result);
    console.log('Result structure:', JSON.stringify(result, null, 2));
    const nodes = result.result.map(item => this.itemToTreeNode(item));
    this.treeNodes.set(nodes);
    console.log('Tree nodes built:', nodes);
    console.log('Tree nodes count:', nodes.length);
    console.log('Tree nodes structure:', JSON.stringify(nodes, null, 2));
  }

  private itemToTreeNode(item: IMatchingResultItem): NzTreeNodeOptions {
    return {
      title: item.title,
      key: item.id.toString(),
      expanded: true, // Start expanded to show data
      children: item.inners?.map(inner => this.itemToTreeNode(inner)) || [],
      isLeaf: !item.inners || item.inners.length === 0,
      origin: item // Store original item data
    };
  }

  private initializeEditForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required]],
      verbatim: [''],
      speakers: this.fb.array([])
    });
  }

  get speakersFormArray(): FormArray {
    return this.editForm.get('speakers') as FormArray;
  }

  onNodeSelect(event: any): void {
    console.log('Node select event:', event);
    // Extract keys from the select event - ng-zorro passes different event structures
    let keys: string[] = [];

    if (Array.isArray(event)) {
      keys = event;
    } else if (event && event.keys) {
      keys = event.keys;
    } else if (event && event.selectedKeys) {
      keys = event.selectedKeys;
    }

    console.log('Extracted keys:', keys);
    this.selectedKeys.set(keys);

    if (keys.length > 0) {
      const nodeKey = keys[0];
      console.log('Looking for item with key:', nodeKey);
      const selectedItem = this.findItemById(+nodeKey);
      console.log('Found item:', selectedItem);
      this.selectedItem.set(selectedItem);
    } else {
      this.selectedItem.set(null);
    }
  }

  onNodeExpand(event: NzFormatEmitEvent): void {
    const keys = event.keys || [];
    this.expandedKeys.set(keys);
  }

  private findItemById(id: number, items?: IMatchingResultItem[]): IMatchingResultItem | null {
    const searchItems = items || this.matchingResult()?.result || [];

    for (const item of searchItems) {
      if (item.id === id) {
        return item;
      }
      if (item.inners) {
        const found = this.findItemById(id, item.inners);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  onEditItem(item: IMatchingResultItem): void {
    this.selectedItem.set(item);
    this.populateEditForm(item);
    this.editDrawerVisible.set(true);
  }

  private populateEditForm(item: IMatchingResultItem): void {
    this.editForm.patchValue({
      title: item.title,
      verbatim: item.verbatim
    });

    // Clear existing speakers
    while (this.speakersFormArray.length) {
      this.speakersFormArray.removeAt(0);
    }

    // Add speakers to form
    item.speakers.forEach(speaker => {
      this.addSpeakerToForm(speaker);
    });
  }

  addSpeakerToForm(speaker?: ISpeaker): void {
    const speakerForm = this.fb.group({
      firstName: [speaker?.firstName || '', [Validators.required]],
      lastName: [speaker?.lastName || '', [Validators.required]],
      gender: [speaker?.gender || ''],
      function: [speaker?.function || ''],
      party: [speaker?.party || ''],
      fullName: [speaker?.fullName || '']
    });

    this.speakersFormArray.push(speakerForm);
  }

  removeSpeaker(index: number): void {
    this.speakersFormArray.removeAt(index);
    this.hasChanges.set(true);
  }

  onSaveChanges(): void {
    if (this.editForm.invalid) {
      return;
    }

    const selectedItem = this.selectedItem();
    if (!selectedItem) {
      return;
    }

    // Update item with form data
    selectedItem.title = this.editForm.value.title;
    selectedItem.verbatim = this.editForm.value.verbatim;
    selectedItem.speakers = this.editForm.value.speakers;

    // Rebuild tree nodes
    this.buildTreeNodes();

    this.hasChanges.set(true);
    this.editDrawerVisible.set(false);
  }

  onSaveMatching(): void {
    if (!this.hasChanges() || !this.matchingVersion()) {
      return;
    }

    this.isSaving.set(true);
    const matchingVersion = this.matchingVersion()!;

    // Create UpdateMatchRequest using the edited item
    const selectedItem = this.selectedItem();
    if (selectedItem) {
      const updateRequest = {
        id: selectedItem.id,
        version: matchingVersion.version || 1,
        title: selectedItem.title,
        verbatim: selectedItem.verbatim,
        status: selectedItem.status,
        speakers: selectedItem.speakers
      };

      this.matchingVersionService.updateMatching(
        matchingVersion.sessionIdentifier || '',
        updateRequest
      ).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          this.hasChanges.set(false);
          const updatedMatchingVersion = response.body;
          if (updatedMatchingVersion) {
            // Update local data with response
            this.matchingVersion.set(updatedMatchingVersion);
            this.matchingResult.set(updatedMatchingVersion.matchingResult || { result: [], speakers: [], matched: [], unMatched: [] });
            this.buildTreeNodes();
          }
        },
        error: (error) => {
          console.error('Error saving matching:', error);
          this.isSaving.set(false);
        }
      });
    }
  }

  onValidateMatching(): void {
    // User Story 2.7 - Validate matching result
    const matchingVersion = this.matchingVersion();
    if (!matchingVersion) {
      return;
    }

    const sessionIdentifier = matchingVersion.sessionIdentifier || '';
    const version = matchingVersion.version || 1;

    this.matchingVersionService.validateMatching(sessionIdentifier, version).subscribe({
      next: (response) => {
        const validatedMatchingVersion = response.body;
        if (validatedMatchingVersion) {
          // Update matching status to VALIDATED
          this.matchingVersion.set(validatedMatchingVersion);

          // Navigate back to session detail with success message
          this.router.navigate(['/sessions', sessionIdentifier]);
        }
      },
      error: (error) => {
        console.error('Error validating matching:', error);
      }
    });
  }

  onCancel(): void {
    this.editDrawerVisible.set(false);
  }

  onBack(): void {
    const matchingVersion = this.matchingVersion();
    if (matchingVersion) {
      this.router.navigate(['/sessions', matchingVersion.sessionIdentifier]);
    } else {
      this.router.navigate(['/sessions']);
    }
  }

  getSpeakerDisplayName(speaker: ISpeaker): string {
    return speaker.fullName || `${speaker.firstName} ${speaker.lastName}`;
  }

  getMatchingStatusColor(status: string): string {
    switch (status) {
      case 'AUTOMATICALLY_MATCHED': return 'green';
      case 'MANUALLY_MATCHED': return 'blue';
      case 'UNMATCHED': return 'orange';
      case 'MATCHING_CONFLICT': return 'red';
      default: return 'default';
    }
  }

  // User Story 2.5 - Manage event/sub-event structure
  onAddEvent(): void {
    const result = this.matchingResult();
    if (!result) return;

    const newEvent: IMatchingResultItem = {
      id: Date.now(), // Generate temporary ID
      title: 'New Event',
      verbatim: '',
      lineNumber: (result.result.length + 1),
      inners: [],
      speakers: [],
      status: 'UNMATCHED',
      level: 0,
      expand: true
    };

    result.result.push(newEvent);
    this.matchingResult.set(result);
    this.buildTreeNodes();
    this.hasChanges.set(true);
  }

  onAddInnerEvent(parentItem: IMatchingResultItem): void {
    const newInner: IMatchingResultItem = {
      id: Date.now() + Math.random(), // Generate unique temporary ID
      title: 'New Sub-Event',
      verbatim: '',
      lineNumber: (parentItem.inners?.length || 0) + 1,
      inners: [],
      speakers: [],
      status: 'UNMATCHED',
      level: (parentItem.level || 0) + 1,
      expand: true
    };

    if (!parentItem.inners) {
      parentItem.inners = [];
    }
    parentItem.inners.push(newInner);

    this.buildTreeNodes();
    this.hasChanges.set(true);
  }

  onDeleteEvent(item: IMatchingResultItem): void {
    const result = this.matchingResult();
    if (!result) return;

    // Find and remove the item from the tree structure
    this.removeItemFromTree(item.id, result.result);
    this.matchingResult.set(result);
    this.buildTreeNodes();
    this.hasChanges.set(true);

    // Clear selection if deleted item was selected
    if (this.selectedItem()?.id === item.id) {
      this.selectedItem.set(null);
      this.selectedKeys.set([]);
    }
  }

  private removeItemFromTree(itemId: number, items: IMatchingResultItem[]): boolean {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === itemId) {
        items.splice(i, 1);
        return true;
      }
      if (items[i].inners && this.removeItemFromTree(itemId, items[i].inners)) {
        return true;
      }
    }
    return false;
  }

  onMoveEventUp(item: IMatchingResultItem): void {
    const result = this.matchingResult();
    if (!result) return;

    // Find the parent array and move item up
    this.moveItemInTree(item.id, result.result, -1);
    this.buildTreeNodes();
    this.hasChanges.set(true);
  }

  onMoveEventDown(item: IMatchingResultItem): void {
    const result = this.matchingResult();
    if (!result) return;

    // Find the parent array and move item down
    this.moveItemInTree(item.id, result.result, 1);
    this.buildTreeNodes();
    this.hasChanges.set(true);
  }

  private moveItemInTree(itemId: number, items: IMatchingResultItem[], direction: number): boolean {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === itemId) {
        const newIndex = i + direction;
        if (newIndex >= 0 && newIndex < items.length) {
          // Swap items
          [items[i], items[newIndex]] = [items[newIndex], items[i]];
        }
        return true;
      }
      if (items[i].inners && this.moveItemInTree(itemId, items[i].inners, direction)) {
        return true;
      }
    }
    return false;
  }
}

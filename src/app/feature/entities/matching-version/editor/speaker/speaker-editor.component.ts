import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ISpeaker } from '@chd-digital-verbatim-front/core/models';
import { EnhancedTreeNode } from '../matching-editor.models';
import { SpeakerManagementService, NewSpeakerForm } from '../services/speaker-management.service';
import { MatchingEditorStateService } from '../matching-editor-state.service';

@Component({
  selector: 'chd-speaker-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzTagModule,
    NzToolTipModule
  ],
  templateUrl: './speaker-editor.component.html',
  styleUrls: ['./speaker-editor.component.scss']
})
export class SpeakerEditorComponent {
  private readonly speakerService = inject(SpeakerManagementService);
  private readonly stateService = inject(MatchingEditorStateService);

  // Signal-based inputs (new Angular syntax)
  readonly selectedItem = input<EnhancedTreeNode | null>();
  readonly isEditMode = input<boolean>();

  // Signal-based outputs (new Angular syntax)
  readonly speakersChanged = output<ISpeaker[]>();

  // Internal component state
  readonly newSpeaker = signal<NewSpeakerForm>({
    firstName: '',
    lastName: '',
    function: '',
    party: ''
  });

  readonly selectedExistingSpeaker = signal<ISpeaker | null>(null);

  // Computed properties
  readonly availableSpeakers = computed(() => {
    const selectedItem = this.selectedItem();
    if (!selectedItem) return [];

    return this.speakerService.getAvailableSpeakers(
      selectedItem,
      this.stateService.treeNodes(),
      this.stateService.state().matchingResult
    );
  });

  readonly canAddNewSpeaker = computed(() => {
    return this.speakerService.validateNewSpeaker(this.newSpeaker());
  });

  readonly assignedSpeakers = computed(() => {
    return this.selectedItem()?.speakers || [];
  });

  readonly hasAssignedSpeakers = computed(() => {
    return this.assignedSpeakers().length > 0;
  });

  // Speaker management methods
  updateNewSpeaker(field: keyof NewSpeakerForm, value: string): void {
    const current = this.newSpeaker();
    this.newSpeaker.set({
      ...current,
      [field]: value
    });
  }

  removeSpeaker(index: number): void {
    const selectedItem = this.selectedItem();
    if (!selectedItem) return;

    this.speakerService.removeSpeaker(selectedItem.id, index);
    this.emitSpeakersChanged();
  }

  addExistingSpeaker(speaker: ISpeaker | null): void {
    const selectedItem = this.selectedItem();
    if (!selectedItem || !speaker) return;

    this.speakerService.assignSpeaker(selectedItem.id, speaker);
    this.emitSpeakersChanged();
  }

  addNewSpeaker(): void {
    const selectedItem = this.selectedItem();
    if (!selectedItem || !this.canAddNewSpeaker()) return;

    this.speakerService.createAndAssignSpeaker(selectedItem.id, this.newSpeaker());

    // Reset the form
    this.newSpeaker.set({
      firstName: '',
      lastName: '',
      function: '',
      party: ''
    });

    this.emitSpeakersChanged();
  }

  getSpeakerDisplayName(speaker: ISpeaker): string {
    return this.speakerService.getSpeakerDisplayName(speaker);
  }

  getSpeakerFullLabel(speaker: ISpeaker): string {
    return this.speakerService.getSpeakerFullLabel(speaker);
  }

  private emitSpeakersChanged(): void {
    // Force a timeout to ensure state has been updated
    setTimeout(() => {
      const speakers = this.selectedItem()?.speakers || [];
      this.speakersChanged.emit(speakers);
    }, 0);
  }

  // Handle existing speaker selection
  onExistingSpeakerSelect(speaker: ISpeaker | null): void {
    this.selectedExistingSpeaker.set(speaker);
  }

  addSelectedExistingSpeaker(): void {
    const speaker = this.selectedExistingSpeaker();
    if (speaker) {
      this.addExistingSpeaker(speaker);
      // Clear the selection after adding
      this.selectedExistingSpeaker.set(null);
    }
  }

  // Handle form submission
  onFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.canAddNewSpeaker()) {
      this.addNewSpeaker();
    }
  }
}

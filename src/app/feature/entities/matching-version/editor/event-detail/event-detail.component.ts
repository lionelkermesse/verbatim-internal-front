import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { ISpeaker } from '@chd-digital-verbatim-front/core/models';
import { EnhancedTreeNode } from '../matching-editor.models';
import { SpeakerEditorComponent } from '../speaker/speaker-editor.component';
import { getStatusColor } from '@chd-digital-verbatim-front/shared/util';

export interface EventDetailChange {
  field: string;
  value: any;
}

@Component({
  selector: 'chd-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzIconModule,
    NzInputModule,
    NzSpaceModule,
    NzTagModule,
    NzTypographyModule,
    NzPopconfirmModule,
    SpeakerEditorComponent
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent {
  // Utils
  readonly getStatusColor = getStatusColor;

  // Signal-based inputs (new Angular syntax)
  readonly selectedItem = input<EnhancedTreeNode | null>();
  readonly isEditMode = input<boolean>();

  // Signal-based outputs (new Angular syntax)
  readonly detailChange = output<EventDetailChange>();
  readonly deleteItem = output<number>();
  readonly saveChanges = output<void>();
  readonly cancelChanges = output<void>();
  readonly speakersChanged = output<ISpeaker[]>();

  // Internal state for editing
  readonly editingTitle = signal<string>('');
  readonly editingVerbatim = signal<string>('');

  // Computed properties
  readonly hasChanges = computed(() => {
    const selectedItem = this.selectedItem();
    if (!selectedItem) return false;

    return this.editingTitle() !== (selectedItem.title || '') ||
           this.editingVerbatim() !== (selectedItem.verbatim || '');
  });

  // Initialize editing values when item changes
  ngOnInit(): void {
    // Watch for selectedItem changes to initialize editing values
    this.initializeEditingValues();
  }

  ngOnChanges(): void {
    this.initializeEditingValues();
  }

  private initializeEditingValues(): void {
    const selectedItem = this.selectedItem();
    if (selectedItem) {
      this.editingTitle.set(selectedItem.title || '');
      this.editingVerbatim.set(selectedItem.verbatim || '');
    }
  }

  // Event handlers
  onTitleChange(value: string): void {
    this.editingTitle.set(value);
  }

  onVerbatimChange(value: string): void {
    this.editingVerbatim.set(value);
  }

  onSaveChanges(): void {
    const selectedItem = this.selectedItem();
    if (!selectedItem || !this.hasChanges()) return;

    // Emit field changes
    if (this.editingTitle() !== (selectedItem.title || '')) {
      this.detailChange.emit({ field: 'title', value: this.editingTitle() });
    }

    if (this.editingVerbatim() !== (selectedItem.verbatim || '')) {
      this.detailChange.emit({ field: 'verbatim', value: this.editingVerbatim() });
    }

    this.saveChanges.emit();
  }

  onCancelChanges(): void {
    // Reset to original values
    this.initializeEditingValues();
    this.cancelChanges.emit();
  }

  onDeleteItem(): void {
    const selectedItem = this.selectedItem();
    if (selectedItem) {
      this.deleteItem.emit(selectedItem.id);
    }
  }

  onSpeakersChanged(speakers: ISpeaker[]): void {
    this.speakersChanged.emit(speakers);
  }
}

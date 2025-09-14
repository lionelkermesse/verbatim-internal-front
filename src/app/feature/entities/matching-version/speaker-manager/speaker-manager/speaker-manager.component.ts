import { Component, forwardRef, inject, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { ISpeaker } from '@chd-digital-verbatim-front/core/models';
import { SpeakerModalComponent } from '../speaker-modal/speaker-modal.component';

@Component({
  selector: 'app-speaker-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSpaceModule,
  ],
  templateUrl: './speaker-manager.component.html',
  styleUrls: ['./speaker-manager.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpeakerManagerComponent),
      multi: true,
    },
  ],
})
export class SpeakerManagerComponent implements ControlValueAccessor {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NzModalService);

  speakers: ISpeaker[] = [];
  onChange: (value: ISpeaker[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: ISpeaker[]): void {
    this.speakers = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onAddSpeaker(): void {
    this.openSpeakerModal();
  }

  onEditSpeaker(speaker: ISpeaker, index: number): void {
    this.openSpeakerModal(speaker, index);
  }

  onRemoveSpeaker(index: number): void {
    this.speakers.splice(index, 1);
    this.onChange(this.speakers);
  }

  private openSpeakerModal(speaker?: ISpeaker, index?: number): void {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: speaker ? 'Edit Speaker' : 'Add Speaker',
      nzContent: SpeakerModalComponent,
      nzData: {
        speaker: speaker,
      },
      nzFooter: [
        {
          label: 'Cancel',
          onClick: (): void => modal.destroy(),
        },
        {
          label: speaker ? 'Save' : 'Add',
          type: 'primary',
          onClick: (contentComponentInstance?: SpeakerModalComponent): void => {
            if (contentComponentInstance && contentComponentInstance.form.valid) {
              if (index !== undefined) {
                this.speakers[index] = contentComponentInstance.form.value;
              } else {
                this.speakers.push(contentComponentInstance.form.value);
              }
              this.onChange(this.speakers);
              modal.destroy();
            }
          },
        },
      ],
    });
  }
}

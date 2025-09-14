import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { IMatchingResultItem } from '@chd-digital-verbatim-front/core/models';
import { SpeakerManagerComponent } from '../../speaker-manager/speaker-manager/speaker-manager.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    SpeakerManagerComponent,
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() event: IMatchingResultItem | null = null;
  @Output() eventUpdated = new EventEmitter<IMatchingResultItem>();

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      verbatim: [''],
      speakers: [[]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.form.patchValue(this.event);
    }
  }

  onSave(): void {
    if (this.form.valid && this.event) {
      const updatedEvent = { ...this.event, ...this.form.value };
      this.eventUpdated.emit(updatedEvent);
    }
  }
}

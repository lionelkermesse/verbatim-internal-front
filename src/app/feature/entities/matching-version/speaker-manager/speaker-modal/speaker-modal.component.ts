import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ng-zorro imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import { ISpeaker } from '@chd-digital-verbatim-front/core/models';

@Component({
  selector: 'app-speaker-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule],
  template: `
    <form nz-form [formGroup]="form">
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzFor="firstName">First Name</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <input nz-input formControlName="firstName" id="firstName" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzFor="lastName">Last Name</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <input nz-input formControlName="lastName" id="lastName" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzFor="gender">Gender</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <input nz-input formControlName="gender" id="gender" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzFor="function">Function</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <input nz-input formControlName="function" id="function" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzFor="party">Party</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <input nz-input formControlName="party" id="party" />
        </nz-form-control>
      </nz-form-item>
    </form>
  `,
})
export class SpeakerModalComponent {
  private readonly fb = inject(FormBuilder);

  @Input() speaker?: ISpeaker;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: [''],
      function: [''],
      party: [''],
      fullName: [''],
    });

    if (this.speaker) {
      this.form.patchValue(this.speaker);
    }
  }
}

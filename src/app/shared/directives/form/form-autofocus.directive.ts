import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[qmsAutofocus]',
})
export default class FormAutofocusDirective implements AfterViewInit {
  focusables = ['input', 'select', 'textarea'];

  constructor(private element: ElementRef) {}

  ngAfterViewInit(): void {
    const input = this.element.nativeElement.querySelector(this.focusables.join(','));
    if (input) {
      input.focus();
    }
  }

  @HostListener('submit')
  submit(): void {
    const input = this.element.nativeElement.querySelector(this.focusables.map(x => `${x}.ng-invalid`).join(','));
    if (input) {
      input.focus();
    }
  }
}

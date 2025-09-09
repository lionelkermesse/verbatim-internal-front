import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[qmsVisibility]',
  standalone: true,
})
export class QmsVisibilityDirective {
  private _qmsVisibility = true; // Default visibility is true

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
  ) {}

  @Input() set qmsVisibility(condition: boolean) {
    this._qmsVisibility = condition;
    this.updateView();
  }

  @Input() set showLoadButton(condition: boolean | '') {
    if (condition === '') {
      this._qmsVisibility = true; // Reset to default if empty
    } else {
      this._qmsVisibility = condition;
    }
    this.updateView();
  }

  updateView(): void {
    if (this._qmsVisibility) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}

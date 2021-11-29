import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[adBars]'
})
export class AdBarsDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}

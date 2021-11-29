import { AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, Renderer2 } from '@angular/core';
import { fromEvent, Observable, Subscription, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[seaShowHideText]'
})
export class ShowHideTextDirective implements AfterViewInit, OnDestroy {

  private _div = this._renderer.createElement('div');
  private _click: Observable<Event>;
  private _sub: Subscription;
  constructor(
    private _elRef: ElementRef<HTMLButtonElement>,
    private _renderer: Renderer2
  ) { }
  ngAfterViewInit() {
    this._div.style.cssText = `
      position: absolute;
      left: ${this._elRef.nativeElement.offsetLeft + this._elRef.nativeElement.offsetWidth + 10}px;
      top: ${this._elRef.nativeElement.offsetTop + this._elRef.nativeElement.offsetHeight / 3}px;
      font-size: ${getComputedStyle(this._elRef.nativeElement).fontSize};
      color: white;
      opacity: 0;
    `;
    this._div.innerHTML = 'Link copied!';
    this._div.classList.add('fade');
    this._click = fromEvent(this._elRef.nativeElement, 'click');
    this._sub = this._click.pipe(debounceTime(1500)).subscribe(_ => {
      this._div.remove();
    });
  }
  @HostListener('click') onClick() {
    this._elRef.nativeElement.parentElement.appendChild(this._div);
  }
  ngOnDestroy() {
    this._sub.unsubscribe();
  }
}

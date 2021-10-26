import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[seaCross]'
})
export class CrossDirective {

  @Input() result: boolean;
  private _clicked = false;

  @HostListener('click') onClick() {
    if (!this._clicked) {
      if (this.result) {
        this.el.nativeElement.append(...this.getCross());
      } else {
        this.el.nativeElement.classList.add('sea');
        this.el.nativeElement.append(...this.getWaves());
      }
      this._clicked = true;
    }
  }

  constructor(
    private el: ElementRef<HTMLDivElement>,
    private renderer: Renderer2
  ) { }

  private getWaves() {
    let even = true, count = 1;
    const waves: Array<HTMLDivElement> = [, , , , ,].fill(0).map((_, index, arr) => {
      const wave = this.renderer.createElement('div');
      wave.innerHTML = '~';
      wave.classList.add('wave');
      if (even) {
        wave.style.left = '15%';
      } else {
        wave.style.right = '15%';
      }
      even = !even;
      wave.style.top = `${count * 7.5}%`;
      count += 2;
      return wave;
    });
    waves[0].style.left = '30%';
    return waves;
  }
  private getCross() {
    const [oneLine, twoLine] = [this.renderer.createElement('div'), this.renderer.createElement('div')];

    oneLine.className = 'cross';
    oneLine.style.transform = 'rotate(45deg)';
    twoLine.className = 'cross';
    twoLine.style.transform = 'rotate(-45deg)';

    return [oneLine, twoLine];
  }
}

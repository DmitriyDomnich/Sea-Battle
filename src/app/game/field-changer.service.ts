import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FieldChangerService {

  private _renderer: Renderer2;
  private _enemyFieldRef: HTMLElement;
  private _playerFieldRef: HTMLElement;

  constructor(private rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public set enemyFieldRef(v: HTMLElement) {
    this._enemyFieldRef = v;
  }
  public set playerFieldRef(v: HTMLElement) {
    this._playerFieldRef = v;
  }
  public get enemyFieldRef() {
    return this._enemyFieldRef;
  }
  public get playerFieldRef() {
    return this._playerFieldRef;
  }

  public addCrossesAndWavesToField(barConfigs: { index: number, type: string }[], target: HTMLElement) {
    barConfigs.forEach(barConfig => {
      const bar = target.children[barConfig.index];
      if (barConfig.type === 'wave') {
        bar.append(...this._getWaves());
        bar.classList.add('sea');
      } else {
        bar.append(...this._getCross());
      }
    })
  }
  public getFieldsInRunningGame() {
    const fields = { enemyField: [], playerField: [] };
    Array.from(this._enemyFieldRef.children)
      .forEach((fieldBar, index, bars) => {
        if (fieldBar.children.length) {
          fields.playerField.push({
            index: index,
            type: fieldBar.children[0].className
          });
        }
      });
    Array.from(this._playerFieldRef.children)
      .forEach((fieldBar, index, bars) => {
        if (fieldBar.children.length > 1) {
          fields.enemyField.push({
            index: index,
            type: fieldBar.children[1].className
          });
        }
      });
    return fields;
  }
  public shootEnemyShip(index: number) {
    const barEl = this._enemyFieldRef.children[index];
    barEl.append(...this._getCross());
  }
  public playerShipShot(index: number) {
    const barEl = this._playerFieldRef.children[index];
    barEl.append(...this._getCross());
  }
  public shootEnemyNothing(index: number) {
    const barEl = this._enemyFieldRef.children[index];
    barEl.append(...this._getWaves());
    barEl.classList.add('sea');
  }
  public playerNothingShot(index: number) {
    const barEl = this._playerFieldRef.children[index];
    barEl.append(...this._getWaves());
    barEl.classList.add('sea');
  }
  private _getWaves() {
    let even = true, count = 1;
    const waves: Array<HTMLDivElement> = [, , , , ,].fill(0).map((_, index, arr) => {
      const wave = this._renderer.createElement('div');
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
  private _getCross() {
    const [oneLine, twoLine] = [this._renderer.createElement('div'), this._renderer.createElement('div')];

    oneLine.className = 'cross';
    oneLine.style.transform = 'rotate(45deg)';
    twoLine.className = 'cross';
    twoLine.style.transform = 'rotate(-45deg)';

    return [oneLine, twoLine];
  }
}

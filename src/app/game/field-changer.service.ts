import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { GameStateService } from '../core/game-state.service';
import { FieldConfig } from './game.component';

@Injectable({
  providedIn: 'root'
})
export class FieldChangerService {

  private _renderer: Renderer2;
  private _enemyFieldRef: HTMLElement;
  private _playerFieldRef: HTMLElement;

  constructor(private rendererFactory: RendererFactory2,
    private _gameStateService: GameStateService) {
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
  public addFullyShotShipsToEnemyField() {
    const enemyShipsConfig: FieldConfig[] = this._gameStateService.enemyField;
    const shipTypes = new Set(enemyShipsConfig.map(conf => conf.shipType));

    shipTypes.forEach(shipType => {
      const oneShipConfigs = enemyShipsConfig.filter(shipConfig => shipConfig.shipType === shipType);
      if (oneShipConfigs.every(shipBarConfig => this._enemyFieldRef.children[shipBarConfig.index].children.length)) {
        const rootElConfig = oneShipConfigs.find(enemyShipConfig => enemyShipConfig.isRootPosition);
        this.prependImageToEnemyField(rootElConfig);
      }
    });
  }
  public getFieldsInRunningGame() {
    const fields = { enemyField: [], playerField: [] };
    Array.from(this._enemyFieldRef.children)
      .forEach((fieldBar, index) => {
        if (fieldBar.children.length) {
          fields.playerField.push({
            index: index,
            type: fieldBar.children[0].className
          });
        }
      });
    Array.from(this._playerFieldRef.children)
      .forEach((fieldBar, index) => {
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
  public checkIfShipDestroyed(shipConfig: FieldConfig) {
    const enemyShipsConfig: FieldConfig[] = this._gameStateService.enemyField;
    const sameShips = enemyShipsConfig.filter(anyShipConfig => anyShipConfig.shipType === shipConfig.shipType);
    if (sameShips.length === 1) {
      return true;
    }
    let shipsKilledCount = 0;
    sameShips.forEach(ship => {
      if (this._enemyFieldRef.children[ship.index].children.length) {
        shipsKilledCount++;
      }
    });
    if (shipsKilledCount === sameShips.length) {
      return true;
    }
    return false;
  }
  public prependImageToEnemyField(shipConfig: FieldConfig) {
    const rootBar = this._getMainBarElement(shipConfig);
    const img = this.getImageNode(rootBar);
    this._enemyFieldRef.children[rootBar.index].prepend(img);
  }
  public getImageNode(barConfig: FieldConfig) {
    const img: HTMLImageElement = this._renderer.createElement('img');
    const imageConfig = this._getImageConfigByNumber(barConfig.shipType);
    img.src = imageConfig.src;
    img.classList.add('shipInRunningGame');
    img.style.height = imageConfig.height * 100 + '%';
    if (barConfig.oriantation === 'horizontal') {
      img.style.transform = 'rotate(-90deg)';
      if ([4, 5, 8].find(num => num === barConfig.shipType)) {
        if (barConfig.shipType === 8) {
          img.classList.add('margin-left');
        } else {
          img.classList.add('margin-right');
        }
      }
    } else if (barConfig.oriantation === 'vertical') {
      if ([4, 5, 8].find(num => num === barConfig.shipType)) {
        img.classList.add('margin-top');
      }
    }
    return img;
  }
  private _getImageConfigByNumber(shipNum: number): { src: string, width: number, height: number } {
    switch (shipNum) {
      case 1:
      case 2:
      case 3:
        return {
          src: 'assets/ships/1place_ship.png',
          width: 10,
          height: 1
        };
      case 4:
      case 5:
        return {
          src: 'assets/ships/2place_ship.png',
          width: 10,
          height: 2
        };
      case 6:
      case 7:
        return {
          src: 'assets/ships/3place_ship.png',
          width: 9,
          height: 3
        };
      default:
        return {
          src: 'assets/ships/4place_ship.png',
          width: 8,
          height: 4
        };
    }
  }
  private _getMainBarElement(shipConfig: FieldConfig) {
    const enemyShipsConfig: FieldConfig[] = this._gameStateService.enemyField;
    const rootShipBar = enemyShipsConfig
      .filter(someShipConfig => someShipConfig.shipType === shipConfig.shipType)
      .find(shipConfig => shipConfig.isRootPosition);
    return rootShipBar;
  }
  private _getWaves() {
    let even = true, count = 1;
    const waves: Array<HTMLDivElement> = [, , , , ,].fill(0).map(_ => {
      const wave = this._renderer.createElement('span');
      wave.innerHTML = '~';
      wave.classList.add('wave');
      if (even) {
        wave.style.left = '15%';
      } else {
        wave.style.right = '15%';
      }
      even = !even;
      wave.style.bottom = `${count * 7.5}%`;
      count += 2;
      return wave;
    });
    waves[0].style.left = '30%';
    waves[4].style.left = '30%';
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

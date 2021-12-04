import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TurnHandlerService } from '../game/turn-handler.service';

type StartGame = string | boolean;

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private _readyState = {
    enemy: false,
    you: false
  };
  private _gameWasGoing = false;
  private _playerFieldConfig: any[];
  private _enemyFieldConfig: any[];
  private _isYourTurn = false;
  private _startGame = new Subject<StartGame>();
  private _turnChange = new Subject<boolean>();
  public turnChange$ = this._turnChange.asObservable();
  public startGame$ = this._startGame.asObservable();
  public endGame$ = new Subject<string>();

  constructor(private _turnHandlerService: TurnHandlerService) {
    _turnHandlerService.turnChange$.subscribe(_ => this.isYourTurn = !this.isYourTurn);
  }

  public set isYourTurn(bool: boolean) {
    this._isYourTurn = bool;

    this._turnHandlerService.resetTimer();
    this._turnHandlerService.startTimer();

    this._turnChange.next(bool);
  }
  public set gameWasGoing(v: boolean) {
    this._gameWasGoing = v;
  }
  public get gameWasGoing() {
    return this._gameWasGoing;
  }
  public set playerField(field: any) {
    if (this._playerFieldConfig) {
      this._isYourTurn = false;
    } else {
      if (!this._enemyFieldConfig) {
        this._isYourTurn = true;
      }
    }
    this._playerFieldConfig = field;
    this._readyState.you = true;
    this._setGameStartState('Wait for your enemy to set up.');
  }
  public set enemyField(field: any) {
    if (field) {
      if (this._enemyFieldConfig) {
        this._isYourTurn = true;
      } else {
        if (!this._playerFieldConfig) {
          this._isYourTurn = false;
        }
      }
      this._enemyFieldConfig = field;
      this._readyState.enemy = true;
      this._setGameStartState('Your enemy is waiting for you.');
    } else {
      this._enemyFieldConfig = null;
      this._readyState.enemy = false;
    }
  }
  public get isYourTurn() {
    return this._isYourTurn;
  }
  public get playerField() {
    return this._playerFieldConfig;
  }
  public get enemyField() {
    return this._enemyFieldConfig;
  }
  public resetState() {
    this._readyState.enemy = false;
    this._readyState.you = false;
    this._playerFieldConfig = null;
    this._enemyFieldConfig = null;
    this._gameWasGoing = false;
    this._isYourTurn = false;
  }
  public isGameOver(fieldEl: HTMLElement, target: '_enemyFieldConfig' | '_playerFieldConfig'): void {
    if (this._allShipsShot(fieldEl.children, target)) {
      this.endGame$.next(target.includes('enemy') ? 'You won' : 'You lost');
    }
    this.endGame$.next('');
  }
  private _allShipsShot(fieldChildren: HTMLCollection, target: '_enemyFieldConfig' | '_playerFieldConfig') {
    const fieldChildrenArr = Array.from(fieldChildren);
    if (this[target].find(config => fieldChildrenArr[config.index].children.length < 2)) {
      return false;
    }
    return true;
  }
  private _setGameStartState(message: string) {
    this._startGame.next(message);
    if (Object.values(this._readyState).every(val => val)) {
      this._startGame.next(true);
    }
  }
}

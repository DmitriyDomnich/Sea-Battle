import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private _readyState = {
    enemy: false,
    you: false
  };
  private _playerField: any;
  private _enemyField: any;
  private _startGame = new Subject<string | number | boolean>();
  public startGame$ = this._startGame.asObservable();

  constructor() { }

  public set playerField(field: any) {
    if (!(this._playerField)) {
      this._playerField = field;
      this._readyState.you = true;
      this._setGameStartState('Wait for your enemy to set up.');
    } else {
      this._playerField = field;
      this._readyState.you = true;
    }
  }
  public set enemyField(field: any) {
    if (field) {
      this._enemyField = field;
      this._readyState.enemy = true;
      this._setGameStartState('Your enemy is waiting for you.');
    } else {
      this._enemyField = null;
      this._readyState.enemy = false;
    }
  }
  public get playerField() {
    return this._playerField;
  }
  public get enemyField() {
    return this._enemyField;
  }
  public emitStartGame() {
    this._startGame.next(true);
  }
  public resetState() {
    this._readyState.enemy = false;
    this._readyState.you = false;
    this._playerField = null;
    this._enemyField = null;
  }
  private _setGameStartState(message: string) {
    this._startGame.next(message);
    if (Object.values(this._readyState).every(val => val)) {
      this._startGame.next(true);
    }
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Howl } from 'howler';
import { fromEvent, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FieldChangerService } from '../game/field-changer.service';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  private _socket: Socket;
  private _joinRoom = new Subject<number>();
  public joinRoom$ = this._joinRoom.asObservable();
  public getGameStateInRunningGame$: Observable<any>;
  public joinRunningGame$: Observable<any>;
  public enemyLeftGame$: Observable<void>;
  public enemyJoinedGame$ = new Subject();
  public connectionError$: Observable<any>;
  public connectionSuccess$: Observable<any>;

  constructor(
    private _gameState: GameStateService,
    private _router: Router,
    private _fieldChangerService: FieldChangerService) { }
  public checkSocketConnection() {
    return this._socket.connected;
  }
  public registerSocketIoConnection() {
    this._socket = io(environment.serverURL);
    this.connectionSuccess$ = fromEvent(this._socket, 'connect');
    this.connectionError$ = fromEvent(this._socket, 'connect_error');

    this._socket.on('roomConnected', () => {
      this._joinRoom.next(1);
    });
    this._socket.on('joinError', (message: string) => {
      if (message.includes('full')) {
        this._joinRoom.next(2);
      } else {
        this._joinRoom.next(0);
      }
    });
    this._socket.on('no-such-room', () => {
      this._joinRoom.next(0);
    });
    this._socket.on('enemyRequestsData', () => {
      if (this._gameState.playerField) {
        if (!this._gameState.enemyField) {
          this.sendFieldConfiguration(this._gameState.playerField, this._router.url.slice(-8));
        } else {
          this.sendBothFieldsConfiguration();
          this.enemyJoinedGame$.next();
        }
      }
    });
    this._socket.on('enemyLeftSetup', () => {
      this._gameState.enemyField = null;
    });
    this.getGameStateInRunningGame$ = fromEvent(this._socket, 'gameIsGoing');
    this._socket.on('someoneReady', (enemyFieldConfig: any) => {
      this._gameState.enemyField = enemyFieldConfig;
    });
  }
  public registerGameEvents() {
    this._socket.on('player-ship-shot', (index) => {
      new Howl({
        src: Math.random() >= 0.5 ? '../../assets/sounds/ship-shot1.mp3' : '../../assets/sounds/ship-shot2.mp3',
        autoplay: true,
        volume: 0.5
      });
      this._gameState.isYourTurn = false;
      this._fieldChangerService.playerShipShot(index);
      this._gameState.isGameOver(this._fieldChangerService.playerFieldRef, '_playerFieldConfig');
    });
    this._socket.on('player-nothing-shot', (index) => {
      new Howl({
        src: Math.random() >= 0.5 ? '../../assets/sounds/water-drop1.mp3' : '../../assets/sounds/water-drop2.mp3',
        autoplay: true,
        volume: 0.5
      });
      this._fieldChangerService.playerNothingShot(index);
      this._gameState.isYourTurn = true;
    });
    this._socket.on('enemyJoinedRunningGame', () => {
      this._socket.emit('sendFieldsInRunningGame',
        this._router.url.slice(-8),
        this._fieldChangerService.getFieldsInRunningGame(),
        this._gameState.isYourTurn ? false : true);
    });
    this.joinRunningGame$ = fromEvent(this._socket, 'sendRunningGameFields');
    this.enemyLeftGame$ = fromEvent(this._socket, 'enemyLeftGame');
  }
  public removeGameEvents() {
    this._socket
      .off('player-ship-shot')
      .off('player-nothing-shot')
      .off('enemyJoinedRunningGame')
      .off('sendRunningGameFields');
  }
  public shootEnemyNothing(index: number) {
    this._socket.emit('shot-nothing', this._router.url.slice(-8), index);
  }
  public shootEnemyShip(index: number) {
    this._socket.emit('shot-ship', this._router.url.slice(-8), index);
  }
  public leaveRoom(roomId: string, leftSetup = false) {
    this._socket.emit('leave-room', roomId, leftSetup);
  }
  public createRoom(roomId: string) {
    this._socket.emit('create-room', roomId);
  }
  public joinRoom(roomId: string) {
    this._socket.emit('join-room', roomId);
  }
  public checkRoom(roomId: string) {
    this._socket.emit('room-exists', roomId);
  }
  public sendFieldConfiguration(yourFieldConfiguration: any, roomId: string) {
    if (this._gameState.playerField !== yourFieldConfiguration) {
      this._gameState.playerField = yourFieldConfiguration;
    }
    this._socket.emit('sendFieldConfiguration', yourFieldConfiguration, roomId);
  }
  public sendBothFieldsConfiguration() {
    this._socket.emit('sendTwoFieldConfiguration', [this._gameState.playerField, this._gameState.enemyField], this._router.url.slice(-8));
  }
  public askForFieldsInRunningGame() {
    this._socket.emit('askForFieldsInRunningGame', this._router.url.slice(-8));
  }
  public requestEnemyData() {
    const roomId = this._router.url.slice(-8);
    this._socket.emit('requestEnemyData', roomId);
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { FieldChangerService } from '../game/field-changer.service';
import { GameStateService } from '../game/game-state.service';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  private _socket: Socket;
  private _joinRoom = new Subject<number>();
  public joinRoom$ = this._joinRoom.asObservable();
  public runningGame$: Observable<any>;

  constructor(
    private _gameState: GameStateService,
    private _router: Router,
    private _fieldChangerService: FieldChangerService) { }
  public checkSocket() {
    if (this._socket) {
      return true;
    }
    return false;
  }
  public registerSocketIoConnection() {
    this._socket = io('http://localhost:3000');
    // this._socket.on('connect_error', (err) => {
    //   console.log(err);

    // })
    this._socket.on('roomConnected', () => {
      this._joinRoom.next(1);
    });
    this._socket.on('joinError', (message: string) => {
      if (message.includes('full')) {
        this._joinRoom.next(2);
      } else {
        this._joinRoom.next(0); // ? was without else
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
        }
      }
    });
    this._socket.on('enemyLeftSetup', () => {
      this._gameState.enemyField = null;
    });
    this._socket.on('gameIsGoing', (fieldConigurations: any[]) => {
      this._gameState.gameWasGoing = true;
      this._gameState.enemyField = fieldConigurations[0];
      this._gameState.playerField = fieldConigurations[1];
    });
    this._socket.on('someoneReady', (enemyFieldConfig: any) => {
      this._gameState.enemyField = enemyFieldConfig;
    });
  }
  public registerGameEvents() {
    this._socket.on('player-ship-shot', (index) => {
      this._fieldChangerService.playerShipShot(index);
      this._gameState.isGameOver(this._fieldChangerService.playerFieldRef, '_playerFieldConfig');
    });
    this._socket.on('player-nothing-shot', (index) => {
      this._fieldChangerService.playerNothingShot(index);
      this._gameState.isYourTurn = true;
    });
    this._socket.on('enemyJoinedRunningGame', () => {
      this._socket.emit('sendFieldsInRunningGame',
        this._router.url.slice(-8),
        this._fieldChangerService.getFieldsInRunningGame(),
        this._gameState.isYourTurn ? false : true);
    });
    this.runningGame$ = fromEvent(this._socket, 'sendRunningGameFields');
  }
  public removeGameEvents(roomId: string) {
    this._socket
      .off('player-ship-shot')
      .off('player-nothing-shot')
      .off('enemyJoinedRunningGame')
      .off('sendRunningGameFields');
    this.leaveRoom(roomId);
  }
  public shootEnemyNothing(index: number) {
    this._socket.emit('shot-nothing', this._router.url.slice(-8), index);
  }
  public shootEnemyShip(index: number) {
    this._socket.emit('shot-ship', this._router.url.slice(-8), index);
  }
  public leaveRoom(roomId: string) {
    this._socket.emit('leave-room', roomId);
  }
  public leaveSetupRoom(roomId: string) {
    this._socket.emit('leave-setup-room', roomId);
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

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { GameStateService } from '../game/game-state.service';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  private _socket: Socket;
  private _joinRoom = new Subject<boolean | string>();
  public joinRoom$ = this._joinRoom.asObservable();

  constructor(private _gameState: GameStateService, private _router: Router) { }
  public checkSocket() {
    if (this._socket) {
      return true;
    }
    return false;
  }
  public registerSocketIoConnection() {
    this._socket = io('http://localhost:3000');
    this._socket.on('roomConnected', () => {
      this._joinRoom.next(true);
    });
    this._socket.on('joinError', (message: string) => {
      this._joinRoom.next(message);
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
      this._gameState.enemyField = fieldConigurations[0];
      this._gameState.playerField = fieldConigurations[1];
    });
    this._socket.on('someoneReady', (enemyFieldConfig: any) => {
      this._gameState.enemyField = enemyFieldConfig;
    });
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
  public sendFieldConfiguration(yourFieldConfiguration: any, roomId: string) {
    this._gameState.playerField = yourFieldConfiguration;
    this._socket.emit('sendFieldConfiguration', yourFieldConfiguration, roomId);
  }
  public sendBothFieldsConfiguration() {
    this._socket.emit('sendTwoFieldConfiguration', [this._gameState.playerField, this._gameState.enemyField], this._router.url.slice(-8));
    this._gameState.emitStartGame();
  }
  public requestEnemyData() {
    const roomId = this._router.url.slice(-8);
    this._socket.emit('requestEnemyData', roomId);
  }
}

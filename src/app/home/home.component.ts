import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { v4 as createCode } from 'uuid';
import { SocketIoService } from '../core/socket-io.service';
import { GameStateService } from '../core/game-state.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('showButton', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  private _navigateSub: Subscription;
  private _connectionErrorSub: Subscription;
  private _connectionSuccessSub: Subscription;
  public disabledUi = true;

  constructor(private _router: Router,
    private _gameState: GameStateService,
    private _socketService: SocketIoService,
    private _snackBar: MatSnackBar) { }
  ngOnInit() {
    this._showMessage();
    this._gameState.resetState();

    if (this._socketService.checkSocketConnection()) {
      this.disabledUi = false;
    }
    this._connectionSuccessSub = this._getSuccessSub();
    this._connectionErrorSub = this._getErrorSub();
  }
  ngOnDestroy() {
    if (this._navigateSub)
      this._navigateSub.unsubscribe();
    if (this._connectionSuccessSub)
      this._connectionSuccessSub.unsubscribe();
    if (this._connectionErrorSub)
      this._connectionErrorSub.unsubscribe();
  }
  public startNewGame() {
    const code = createCode().slice(0, 8);
    this._socketService.createRoom(code);
    this._router.navigate(['setup', code]);
  }
  public joinExistingGame(inviteLink: string) {
    const code = inviteLink.slice(-8);
    this._navigateSub = from(this._router.navigate(['setup', code])).subscribe(_ => {
      this._showMessage();
    });
  }
  private _showMessage() {
    const test: string = this._router.parseUrl(this._router.url).queryParams['err'];
    if (test) {
      const message = +test === 0 ? "Room doesn't exist." : "The room is full.";
      this._snackBar.open(message, 'Ok', {
        duration: 2000,
        panelClass: 'snack-bar',
      });
    }
  }
  private _getErrorSub() {
    return this._socketService.connectionError$.subscribe(err => {
      this.disabledUi = true;
      this._connectionErrorSub.unsubscribe();
      this._connectionSuccessSub = this._getSuccessSub();
    });
  }
  private _getSuccessSub() {
    return this._socketService.connectionSuccess$.subscribe(_ => {
      this.disabledUi = false;
      this._connectionSuccessSub.unsubscribe();
      this._connectionErrorSub = this._getErrorSub();
    });
  }
}
